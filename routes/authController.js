const express        = require("express");
const authController = express.Router();

// User model
const User  = require("../models/user");

// Bcrypt to encrypt passwords

const bcrypt         = require("bcrypt");
const bcryptSalt     = 10;
const passport = require("passport");
const ensureLogin = require("connect-ensure-login");

authController.get("/auth/facebook", passport.authenticate("facebook"));
authController.get("/auth/facebook/callback", passport.authenticate("facebook", {
  successRedirect: "/private-page",
  failureRedirect: "/"
}));


authController.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

authController.post("/signup", (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    var salt     = bcrypt.genSaltSync(bcryptSalt);
    var hashPass = bcrypt.hashSync(password, salt);

    var newUser = User({
      username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup", { message: "The username already exists" });
      } else {
        res.redirect("/login");
      }
    });
  });
});

authController.get("/login", (req, res, next) => {
   res.render("auth/login", { "message": req.flash("error") });
});

authController.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

authController.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("private", { user: req.user });
});

authController.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = authController;








