import express from "express";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const saltRounds = 10;
// salting -> Adding random combination of letters to the password and then Hash it using the hash fucntion;
// salting round -> number of times Hashing a hash + random letters(salt); 
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
    const pass = req.body.password;
    // creating hash of the password and storing that in the Db;
    bcrypt.hash(pass, saltRounds).then(function(hash) {
        const newUser = new Notes({// Level 1 encription just storing the username and password in Db;
            email:user,
            password:hash
            
    });
            newUser.save();
            res.render("secrets");
    });
   
})
app.post("/login", (req,res)=>{
    const user = req.body.username;
    const pass = req.body.password;
    Notes.findOne({email:user}).then(data=>{
        console.log(data.password);
        if(data){
            // Comparing the Hash associated with that email stored in Db with the the entered password hash;
            bcrypt.compare(pass, data.password).then(function(result) {
            // result will give true if match else false;
                if(result){
                    res.render("secrets");
                }else{
                    res.redirect("/login");
                }
            });
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