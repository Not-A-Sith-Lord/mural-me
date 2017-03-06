ovar express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

const session       = require("express-session");
const bcrypt        = require("bcrypt");
const passport      = require("passport");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local").Strategy;
const FbStrategy = require('passport-facebook').Strategy;
const authController = require("./routes/authController");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/passport-local");
//this is how to enforce stuf before saving to db collection
const userSchema = new Schema({
  name: String,
  color: String,
  age: Number
});
const User  = require("./models/user.js");
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//passport
app.use(session({
  secret: "passport-local-strategy",
  resave: true,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//passport
// passport.serializeUser((user, cb) => {
//   cb(null, user.id);
// });
//
// passport.deserializeUser((id, cb) => {
//   console.log("id", id)
//   User.findOne({ "_id": id }, (err, user) => {
//     if (err) { return cb(err); }
//     cb(null, user);
//   });
// });

passport.use(new FbStrategy({
  clientID: "...",
  clientSecret: "...",
  callbackURL: "http://localhost:3000/auth/facebook/callback"
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile);
}));

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

passport.use(new LocalStrategy({
   passReqToCallback: true
}, (req, username, password, next) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false, { message: "Incorrect username" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Incorrect password" });
    }

    return next(null, user);
  });
}));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', authController);
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
