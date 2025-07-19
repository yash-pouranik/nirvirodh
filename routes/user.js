const express = require("express");
const route = express.Router();
exports.route = route;
const { isLoggedIn } = require("../middleware");
const controller = require("../controllers/user")

route.get("/signup", controller.signupForm);

// Signup
route.post("/signup", controller.signup);

route.get("/login", controller.loginForm);

// Login
route.post("/login", controller.login);

route.get("/logout", isLoggedIn, controller.logout);

route.get("/dashboard", isLoggedIn, controller.getDashboard);

//notification
route.get("/notifications", isLoggedIn, controller.getNotifications);

module.exports = route;