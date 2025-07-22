const Team = require("../models/teamInfo");
const User = require("../models/user");
const sendInvitationEmail = require("../utils/sendInvitationMail");

module.exports.createTeamForm = (req, res) => {
    res.render("user/createTeam");
}

module.exports.createTeam = async (req, res) => {
  const { teamName, maxMembers } = req.body;

  const newTeam = new Team({
    teamName,
    maxMembers,
    leader: req.user._id,
    members: [req.user._id],
  });

  await newTeam.save();

  req.user.teamsJoined.push(newTeam._id);
  await req.user.save();

  req.flash("success", "Team created successfully!");

  // ✅ Redirect to invite with team ID
  res.redirect(`/inviteMembers?t_id=${newTeam._id}`);
}


module.exports.getJoinTeamForm = (req, res) => {
   const teamFromLink = req.query.team || "";
   res.render("user/joinaTeam", { prefillTeam: teamFromLink });
}



module.exports.joinTeam = async (req, res) => {
  const { teamName } = req.body;

  const team = await Team.findOne({ teamName });

 if (!team) {
    req.flash("error", "Team not found.");
    return res.redirect("/join");
  }

  //adding notification
  const Notification = require("../models/notification");

  await Notification.create({
    recipient: team.leader,              // jisko notification milni hai
    sender: req.user._id,                // jo join kar raha hai
    team: team._id,                      // kis team ke liye
    type: "join_request",                // custom type for later filtering
    status: "pending"                    // for accept/reject handling
  });

    // Check if already a member
  if (team.members.includes(req.user._id)) {
    req.flash("error", "You are already a member of this team.");
    return res.redirect("/dashboard");
  }

    // Check if team is full
  if (team.members.length >= team.maxMembers) {
    req.flash("error", "Team is full.");
    return res.redirect("/join");
  }
  
  req.flash("success", `Your request to join the team successfully sent!`);
  res.redirect("/dashboard");
}


module.exports.teamJoinReq_respondIt = async(req, res) => {

  const notiId = req.params.id;
  console.log(req.body);

  const Notification = require("../models/notification");
  
  const notification = await Notification.findById(notiId);

  if(!notification) {
    req.flash("error", "request Doesnt exist!");
    return res.redirect("/dashboard");
  }

  if(notification.status === "accepted") {
    req.flash("success", "already in the team or exited!");
    return res.redirect("/dashboard");
  }
  
  if(notification.status === "rejected") {
    req.flash("success", "already rejected");
    return res.redirect("/dashboard");
  }
  

  const {response, teamId, requestedUser} = req.body; 


  const team = await Team.findById(teamId);
  const reqUser = await User.findById(requestedUser);
  
  if(!team) {
    req.flash("error", "Team doesn't Exist");
    return res.redirect("/dashboard");
  }

  if(!reqUser) {
    req.flash("error", "Requested User doesn't Exist");
    return res.redirect("/dashboard");
  }

  if(response === "accept"){
      // Add user to team
    team.members.push(reqUser._id);
    await team.save();

    // Add team to user's joined list
    reqUser.teamsJoined.push(team._id);
    await reqUser.save();

    notification.status = "accepted"
    await notification.save();


  } else if (response === "reject") {
      
    await Notification.create({
        recipient: reqUser,              // jisko notification milni hai
        sender: team.leader,                // jo join kar raha hai
        team: team._id,                      // kis team ke liye
        type: "req_rejected",                // custom type for later filtering
        status: "rejected"                    // for accept/reject handling
      });

      notification.status = "rejected"
      await notification.save();

  }


  res.redirect("/dashboard");
} 


module.exports.markReadToNotification = async(req, res) => {
  const Notification = require("../models/notification");
  
  const nId = req.params.nId;
  const notification = await Notification.findById(nId);
  const user = await User.findById(req.user._id);



  if(!notification) {
    req.flash("error", "that Message does not exist!");
    res.redirect(req.get('referer') || '/fallback-path');
  }

   if(!user) {
    req.flash("error", "that user does not exist!");
    res.redirect(req.get('referer') || '/fallback-path');
  }

  notification.status = "markedAsRead";
  notification.type = "complete";
  await notification.save();

  req.flash("success", "marked as read!");
  res.redirect(req.get('referer') || '/fallback-path');
}


module.exports.teamNameSuggestions = async (req, res) => {
  const query = req.query.q?.toLowerCase() || "";
  if (!query) return res.json([]);

  const teams = await Team.find({ teamName: { $regex: query, $options: "i" } }).limit(6);
  const names = teams.map(t => t.teamName);
  res.json(names);
}




module.exports.inviteTeamMembersForm = async (req, res) => {
  const teamId = req.query.t_id;
  const team = await Team.findById(teamId);

  if (!team) {
    req.flash("error", "Team not found");
    return res.redirect("/dashboard");
  }

  res.render("user/inviteTeamMembers", { team });
}

module.exports.inviteTeamMembersSendMail = async (req, res) => {
  const team = await Team.findById(req.body.t_id); // ⬅️ make sure to send this hidden input in form

  if (!team) {
    req.flash("error", "Team not found.");
    return res.redirect("/dashboard");
  }

  const emails = [req.body.email1, req.body.email2, req.body.email3, req.body.email4];

  for (const email of emails) {
    if (email?.trim()) {
      await sendInvitationEmail({
        to: email,
        teamName: team.teamName,
        inviterName: req.user.username
      });
    }
  }

  req.flash("success", "Invite Sent");
  res.redirect("/dashboard");
}

module.exports.inviteMemberToTeamGetMailSuggestions = async (req, res) => {
  const query = req.query.q?.toLowerCase() || "";
  if (!query) return res.json([]);

  const users = await User.find({ email: { $regex: query, $options: "i" } }).limit(6);
  const matches = users.map(u => u.email);
  
  res.json(matches);
}

module.exports.getTeam = async(req, res) => {
    const teamId = req.params.id;
    const team = await Team.findById(teamId)
    .populate("leader")
    .populate("members")
    .populate("project");
    
    if (!team.members.some(member => member._id.equals(req.user._id))) {
      req.flash("error", "You are not part of this team.");
      return res.redirect("/dashboard");
    }



  res.render("user/eachTeam", {team})
}