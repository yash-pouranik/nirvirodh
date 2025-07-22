//const files = await File.find({ project: projectId });

const express = require("express");
const route = express.Router();
const {isLoggedIn, isLeader, isLeaderByQuery} = require("../middleware")
const controller = require("../controllers/team");

console.log(controller);
console.log("inviteTeamMembersForm:", controller.inviteTeamMembersForm);
console.log("isLeader:", isLeader);


route.get("/create", isLoggedIn, controller.createTeamForm);

//create team
route.post("/create", isLoggedIn, controller.createTeam);

//join
route.get("/join", isLoggedIn, controller.getJoinTeamForm)

route.post("/join", isLoggedIn, controller.joinTeam);

//join to team
route.put("/notifications/:id/respond", isLoggedIn, controller.teamJoinReq_respondIt);

route.put("/notifications/:nId/markread", controller.markReadToNotification)

//to fetch teams
// Search teams route (use in your team.js or separate route file)
route.get("/searchTeams", controller.teamNameSuggestions);

route.get("/inviteMembers", isLoggedIn, isLeaderByQuery, controller.inviteTeamMembersForm);

//send mail
route.post("/sendInviteMail", isLoggedIn, controller.inviteTeamMembersSendMail);

route.get("/searchEmails", controller.inviteMemberToTeamGetMailSuggestions);

route.get("/dashboard/team/:id", isLoggedIn, controller.getTeam)


module.exports = route;