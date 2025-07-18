const express = require("express");
const route = express.Router();
const User = require("../models/user");
const Team = require("../models/teamInfo");
const Notification = require("../models/notification");
const { isLoggedIn } = require("../middleware");
const passport = require("passport");



route.get("/signup", (req, res) => {
    res.render("user/signup");
})


// Signup
route.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const user = new User({ username, email, password });
  await user.save();
  req.login(user, () => res.redirect("/"));
});


route.get("/login", (req, res) => {
    res.render("user/login");
});

// Login
route.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome back!");
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});



route.get("/logout", isLoggedIn, (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      return res.redirect("/dashboard");
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/login");
  });
});



route.get("/dashboard", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: "teamsJoined",
      populate: {
        path: "project",
      },
    });

  res.render("user/dashboard", { currUser: user, teams: user.teamsJoined });
});


//notification
route.get("/notifications", isLoggedIn, async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id})
    .populate("sender", "username")
    .populate("team", "teamName")
    .sort({ createdAt: -1 });

 console.log(notifications)
  res.render("user/notifications", { notifications });
});


module.exports = route;
