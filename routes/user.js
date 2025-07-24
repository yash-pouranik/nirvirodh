const express = require("express");
const route = express.Router();
exports.route = route;
const { isLoggedIn, notLoggedIn } = require("../middleware");
const controller = require("../controllers/user")

route.get("/signup", notLoggedIn, controller.signupForm);

// Signup
route.post("/signup", notLoggedIn, controller.signup);

route.get("/login", notLoggedIn, controller.loginForm);

// Login
route.post("/login", notLoggedIn, controller.login);

route.get("/logout", isLoggedIn, controller.logout);

route.get("/dashboard", isLoggedIn, controller.getDashboard);

//notification
route.get("/notifications", isLoggedIn, controller.getNotifications);

module.exports = route;