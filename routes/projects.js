const express = require("express");
const route = express.Router();
const {isLoggedIn, isLeaderByParams, isLeaderByQuery} = require("../middleware")
const Team = require("../models/teamInfo");
const Project = require("../models/project");
const File = require("../models/files");
const User = require("../models/user");
const user = require("../models/user");

//for socket.io
const emitToTeam = require("../utils/emitHelper");
// for file delete
//emitToTeam(io, teamId, "fileDeleted", {
//  fileId: file._id
//});
//

//for github fetch
const axios = require("axios");





route.get("/dashboard/team/:id/project/new", isLoggedIn, (req, res) => {
    const teamId = req.params.id;
    res.render("project/createProject", {teamId});
});



route.post("/dashboard/team/:id/project/new", isLoggedIn, async (req, res) => {
  const { projName, projDescription } = req.body;
  const teamId = req.params.id;
  const team = await Team.findById(teamId);
  if (!team.members.includes(req.user._id)) {
    req.flash("error", "Unauthorized to add project to this team.");
    return res.redirect("/dashboard");
  }

  const newProject = new Project({ projName, description: projDescription, team: teamId });
  console.log(newProject)
  await newProject.save();

  team.project.push(newProject._id);
  await team.save();

  res.redirect(`/dashboard/team/${teamId}`);
});


route.get("/team/:teamId/project/:projId", isLoggedIn, async (req, res) => {
  try {
    const { projId, teamId } = req.params;

    const team = await Team.findById(teamId);

    const member = req.user._id;
    let isMember = false;

    isMember = team.members.some((ele) => {
      return ele.toString() === member._id.toString();
    })

    const project = await Project.findById(projId).populate("team");
    const files = await File.find({ project: projId })
    .populate("lockedBy")
    .populate("lastEditedBy");

  

  


    res.render("project/eachProject", { project, files, isMember});
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});


route.post("/team/:tId/project/:pId/file", async(req, res) => {
  const {tId, pId} = req.params;
  const team = await Team.findById(tId);
  const project = await Project.findById(pId);
  const fileName = req.body.fileName;

  try{
      const file = new File({
        fileName: fileName,
        project: project,
      });

      await file.save();

      emitToTeam(io, teamId, "fileCreated", {
        fileId: file._id,
        fileName: file.fileName
      });


      res.redirect(req.get('referer') || '/fallback-path');
  } catch(e) {
    req.flash("error", "Caught some error! retry.");
    res.redirect(req.get('referer') || '/fallback-path');
  }

});


route.put("/file/takeaccess/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate({
      path: "project",
      populate: { path: "team" },
    });

    if (!file) {
      req.flash("error", "File not found");
      return res.redirect("back");
    }

    file.isLocked = true;
    file.lockedBy = req.user._id;
    await file.save();

    // 🔔 Emit real-time update using helper
    const io = req.app.get("io");

    console.log(io);
    console.log("🔔 Emitting fileUpdated to room:", file.project.team._id.toString());
    emitToTeam(io, file.project.team._id, "fileUpdated", {
      fileId: file._id,
      status: file.isLocked ? "locked" : "unlocked",
      lockedBy: req.user.username,
    });
    


    return res.redirect(req.get('referer') || '/fallback-path');
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get('referer') || '/fallback-path');
  }
});


route.put("/file/leaveaccess/:id", isLoggedIn, async(req, res) => {
  
  
  const fileId = req.params.id;
  const file = await File.findById(fileId)
    .populate({
      path: "project",
      populate: {
        path: "team", // assuming 'team' is an array of User ObjectIds
        model: "Team"
      }
    })
    .populate("lockedBy");

  const userId = req.user._id;
  const user =  await User.findById(userId)
  .populate("teamsJoined");

  // Check if user is in file.project.team



  if(!file) {
    req.flash("error", "File deleted or doesn't exist!");
    return res.redirect(req.get('referer') || '/fallback-path');
  }

  if(!file.isLocked) {
    req.flash("error", `file is already unlocked`);
    return res.redirect(req.get('referer') || '/fallback-path');
  }
  if(!user) {
    req.flash("error", "User deleted or doesn't exist!");
    return res.redirect(req.get('referer') || '/faollback-path');
  }

  if (!file.project || !file.project.team) {
    
  req.flash("error", "Project or team not found");
  return res.redirect(req.get('referer') || '/fallback-path');
}


console.log("file.project.team._id:", file.project.team?._id?.toString());
console.log("user.teamsJoined:", user.teamsJoined.map(t => t._id.toString()));


const teamsJoined = user.teamsJoined;


let isTeamMember = false;

for (const team of user.teamsJoined) {
  if (team._id.toString() === file.project.team._id.toString()) {
    isTeamMember = true;
    break;
  }
}

if (!isTeamMember) {
  req.flash("error", "You are not part of this project team");
  return res.redirect(req.get('referer') || '/fallback-path');
}



  file.lockedBy = null;
  file.isLocked = false;
  file.lastEditedBy = user._id;

  console.log("Saving file with lastEditedBy:", file.lastEditedBy);


  await file.save();

   // 🔔 Emit real-time update using helper
  const io = req.app.get("io");
  
    emitToTeam(io, file.project.team._id, "fileUpdated", {
      fileId: file._id,
      status: file.isLocked ? "locked" : "unlocked",
      lockedBy: req.user.username,
  });


  //socket.io
  io.to(file.project.team._id.toString()).emit("fileUpdated", {
    fileId: file._id,
    status: file.isLocked ? "locked" : "unlocked",
    unlockedBy: user.username
  });


  req.flash("success", "Now you have access to  make edits in this file");
  return res.redirect(req.get('referer') || '/fallback-path');


})


//start project
route.put("/project/:pid/start", isLoggedIn, async(req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  const projectId = req.params.pid;
  const project = await Project.findById(projectId)
  .populate({
    path: "team",
    populate: {
      path: "members",
      select: "username email", // Select fields as needed
    },
  });


  console.log("_______________");
  console.log(project);

  let isMember = project.team.members.some((ele) => {
    console.log(`${ele} === ${userId}`);
    return ele._id.toString() === userId.toString();
  })

  
  console.log("_______________");
  console.log(isMember);

  if(!isMember) {
    req.flash("error", "You are not part of this project team");
    return res.redirect(req.get('referer') || '/fallback-path');
  }

  project.isWorking = true;
  await project.save();

  const io = req.app.get("io");

  io.to(project.team._id.toString()).emit("projectStatusChanged", {
    projectId: project._id,
    isWorking: true
  });



  const Notification = require("../models/notification");

  for(member of project.team.members) {
    await Notification.create({
    recipient: member,              // jisko notification milni hai
    sender: project.team.leader,                // jo join kar raha hai
    team: project.team._id,                      // kis team ke liye
    type: "project_started",                // custom type for later filtering
    status: "pending"                   // for accept/reject handling
  });
  }


  req.flash("success", "projected started");
  return res.redirect(req.get('referer') || '/fallback-path');


});

//stop working on a project
route.put("/project/:pid/stop", isLoggedIn, async(req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  const projectId = req.params.pid;
  const project = await Project.findById(projectId)
  .populate("team")
  .populate("team", "members");

  console.log("_______________");
  console.log(project);

  if(!project) {
    req.flash("error", "project doesn't exists");
    return res.redirect(req.get('referer') || '/fallback-path');
  }

  let isMember = project.team.members.some((ele) => {
    console.log(`${ele} === ${userId}`);
    return ele.toString() === userId.toString();
  })

  console.log("_______________");
  console.log(isMember);

  if(!isMember) {
    req.flash("error", "You are not part of this project team");
    return res.redirect(req.get('referer') || '/fallback-path');
  }

  project.isWorking = false;
  await project.save();

  const files = await File.find({ project: req.params.pid });

  if(!files) {
    const io = req.app.get("io");
    io.to(project.team._id.toString()).emit("projectStatusChanged", {
      projectId: project._id,
      isWorking: false
    });
    req.flash("error", "no files present");
    return res.redirect(req.get('referer') || '/fallback-path');
  }

  for (const file of files) {
    file.isLocked = false;
    file.lockedBy = null;
    await file.save();
  }




  const io = req.app.get("io");
  io.to(project.team._id.toString()).emit("projectStatusChanged", {
    projectId: project._id,
    isWorking: false
  });






  req.flash("success", "Team taking nap!");
  return res.redirect(req.get('referer') || '/fallback-path');

})


route.delete("/team/:teamId/project/:projId/delete", isLoggedIn, isLeaderByParams, async (req, res) => {
  try {
    console.log("DELETE route hit", req.params);
        console.log("dltt")
    const { teamId, projId } = req.params;

    const project = await Project.findById(projId);
    if (!project) {
      req.flash("error", "Project not found or already deleted!");
      return res.redirect("/dashboard");
    }

    // Optional: Confirm project.team matches teamId (extra safety)
    if (project.team.toString() !== teamId) {
      req.flash("error", "Invalid team or project mismatch!");
      console.log("dltt:sddddddddddd")
      return res.redirect("/dashboard");
      
    }

    await project.deleteOne();
    console.log("dltt") // ✅ This will trigger pre('deleteOne') middleware

    req.flash("success", "Project deleted successfully!");
    return res.redirect('/dashboard');
  } catch (err) {
    console.error("Error deleting project:", err);
    req.flash("error", "Something went wrong!");
    return res.redirect(req.get('referer') || '/dashboard');
  }
});



route.post("/team/:tId/project/:pId/file/github", async (req, res) => {
  const { tId, pId } = req.params;
  const { GITHUB_USERNAME, GITHUB_REPO, BRANCH = "main" } = req.body;

  try {
    const team = await Team.findById(tId);
    const project = await Project.findById(pId);

    if (!team || !project) {
      return res.status(404).json({ message: "Team or project not found" });
    }

    // STEP 1: Validate repo
    const repoCheckUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}`;
    const branchCheckUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/branches/${BRANCH}`;

    const headers = { "User-Agent": "YourAppName" };

    try {
      await axios.get(repoCheckUrl, { headers }); // Will throw if repo not found
      await axios.get(branchCheckUrl, { headers }); // Will throw if branch not found
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        req.flash("error", "GitHub repo or branch not found.");
        return res.redirect(req.get('referer') || '/fallback-path');
      }
      return res.status(500).json({ message: "Error validating GitHub repo.", error: err.message });
    }

    // STEP 2: Fetch file tree
    const githubApiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/git/trees/${BRANCH}?recursive=1`;

    const response = await axios.get(githubApiUrl, { headers });

    const allItems = response.data.tree || [];

    const githubFiles = allItems
      .filter(item => item.type === "blob")
      .map(file => ({
        name: file.path.split("/").pop(),
        path: file.path,
        githubUrl: `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}/blob/${BRANCH}/${file.path}`
      }));

    for (const gFile of githubFiles) {
      const file = new File({
        fileName: gFile.path,
        project: project._id,
        githubURL: gFile.githubUrl,
      });
      await file.save();
    }


    req.flash("success", "Repo Fetched Successfully");
    return res.redirect(req.get('referer') || '/fallback-path');

  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    req.flash("error", "Something went wrong");
    return res.redirect(req.get('referer') || '/fallback-path');
}
});


module.exports = route;