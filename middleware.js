module.exports.notLoggedIn = (req, res, next) => {
  if(req.user) {
    return res.redirect("/dashboard");
  } else {
    return next();
  }
}



module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    req.flash("error", "You must be logged in to access that page.");
    return res.redirect("/login");
  }
  next();
};


const { response } = require("express");
const Team = require("./models/teamInfo");

module.exports.isLeaderByQuery = async (req, res, next) => {
    const teamId = req.query.t_id;
    const team = await Team.findById(teamId);
  if(req.user && req.user._id.toString() === team.leader._id.toString()){
    return next();
  }
  res.redirect("/dashboard");
}

module.exports.isLeaderByParams = async(req, res, next) => {
  const teamId = req.params.teamId;
  try{
    const team = await Team.findById(teamId);
    if(!team) {
      req.flash("error", "team not found!")
      return res.redirect("/dashboard");
    }
    const userId = req.user._id.toString();
    if(userId && userId === team.leader._id.toString()) {
      return next();
    }
    next();
  } catch(er) {
    req.flash("error", "something went wrong!")
    return res.redirect("/dashboard");
  }
}