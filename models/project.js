const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const File = require("./files");

const projectSchema = new Schema({
  projName: String,
  description: String,
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  isWorking: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Single post-deleteOne hook handling both team update & file deletion
projectSchema.post('deleteOne', { document: true, query: false }, async function (doc) {
  try {
    const Team = require("./teamInfo");
    const File = require("./files");

    // ✅ Just remove project from team
    await Team.findByIdAndUpdate(doc.team, {
      $pull: { project: doc._id }
    });

    // ✅ Delete all files associated with this project
    await File.deleteMany({ project: doc._id });

  } catch (err) {
    console.error("Error in Project deleteOne post hook:", err);
  }
});


module.exports = mongoose.model("Project", projectSchema);
