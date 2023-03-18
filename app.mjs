import express from "express";
const app = express();
import bodyParser from "body-parser";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from 'passport-google-oauth20';
import passportLocalMongoose from "passport-local-mongoose";
import LocalStrategy from 'passport-local';
import * as dotenv from 'dotenv';
dotenv.config();
import bcrypt from "bcrypt";
app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine","ejs")
app.use(express.static("public"))
app.use(
  session({
    secret: "Justarandomstring.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://127.0.0.1:27017/secrects");
const userSchema = new mongoose.Schema({ 
  username: String,
  googleId:String,
  password:String,
  secret:String
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(new LocalStrategy(User.authenticate()));
// creating the google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.client_id,
  clientSecret:  process.env.client_secret,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo' // added bcoz of google+ API deprication;
},
function(accessToken, refreshToken, profile,cb){
  User.findOne({googleId: profile.id})// finding user in data base
  .then((founduser)=>{
      if(!founduser){  //if no foundUser , we create one
        const newUser = new User({
          username: profile.displayName,
          googleId: profile.id
        })
        newUser.save() //save the User and then send back the newly created user
        .then(() => {
          cb(null, newUser)
        })
        .catch((err)=>{
          cb(err)
        })
      } else { //if user already exist, just send back the user
        cb(null, founduser)
      }
    })
    .catch((err)=>{
      cb(err)
    })
  }
  ));
//serialize user
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
//deserialize user
passport.deserializeUser(function (id, done) {
  console.log("Deserializing User");
  try {
    User.findById(id).then((user) => {
      done(null, user);
    });
  } catch (err) {
    done(err);
  }
});
//get routes
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render('secrets');
} else {
    console.log('user does not exist');
    res.redirect('/login');
}
});
// google get methods
app.get('/auth/google',passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/secrets', passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });
app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});
app.get('/submit',(req,res)=>{
  res.render("submit");
})
//post routes
app.post("/register", function (req, res) {
    User.register(
      { username: req.body.username },
      req.body.password,
      function (err, user) {
          if (err) {
              console.log(err);
              res.redirect('/register');
          } else {
              passport.authenticate('local')(req, res, function () {
                  res.redirect('/secrets');
              });
          }
      }
  );
});
app.post('/login', function (req, res) {
  //passport version
  const user = new User({
      username: req.body.username,
      password: req.body.password,
  });
  console.log('[ ' + req.body.username + ' ]' + ' LOGGED IN');
  req.login(user, function (err) {
      if (err) {
          return next(err);
      } else {
          passport.authenticate('local')(req, res, function () {
              res.redirect('/secrets');
          });
      }
  });
});

app.post("/submit",(req,res)=>{
  const secret = req.body.secret;

}
  
);
//listen
app.listen(3000, () => {
  console.log("Server Running on Port 3000");
});