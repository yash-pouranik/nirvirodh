const express = require("express");
const route = express.Router();

route.get("/", (req, res) => {
    console.log(req.user)
    res.render("home/home");
})





module.exports = route;