module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    req.flash("error", "You must be logged in to access that page.");
    return res.redirect("/login");
  }
  next();
};


const Team = require("./models/teamInfo");

module.exports.isLeader = async (req, res, next) => {
    const teamId = req.query.t_id;
    const team = await Team.findById(teamId);
  if(req.user && req.user._id.toString() === team.leader._id.toString()){
    return next();
  }
  res.redirect("/dashboard");
}