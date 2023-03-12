import * as dotenv from 'dotenv';
import md5 from 'md5';
dotenv.config()
import express from "express";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
const url = "mongodb://127.0.0.1:27017/secrets";
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect(url);
const schema = new mongoose.Schema({
    email:String,
    password:String
});
const Notes = mongoose.model('note',schema);
app.get('/',(req,res)=>{
    res.render('home');
})
app.get('/:pageName',(req,res)=>{
    if(req.params.pageName === 'ico')return;
    res.render(req.params.pageName);
})
app.post("/register", (req,res)=>{
    const user = req.body.username;
    const pass = md5(req.body.password);
    const newUser = new Notes({// Level 1 encription just storing the username and password in Db;
        email:user,
        password:pass
});
    newUser.save();
    res.render("secrets");
})
app.post("/login", (req,res)=>{
    const user = req.body.username;
    const pass = md5(req.body.password);
    Notes.findOne({email:user}).then(data=>{
        if(data){
            if(data.password === pass){
                res.render("secrets");
            }else{
                res.redirect("/login");
            }
        }else{
            res.redirect("/login");
        }
        
    }).catch(err=>{
        console.log(err);
    })
   
})
app.listen(3000,()=>{
    console.log("Server Started Successfully...");
})