const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Project = require("./project");
const User = require("./user")

const teamSchema = new Schema({
  teamName: {
    type: String,
    required: true,
  },
  maxMembers: {
    type: Number,
    required: true,
  },
    leader: {
    type: Schema.Types.ObjectId,
    ref: "User",      // 👈 Leader reference
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"  // 🔁 Correct ref name
    }
  ],
  project: [
    {
      type: Schema.Types.ObjectId,
      ref: "Project"  // If you’ll add a project model
    }
  ]
});

module.exports = mongoose.model("Team", teamSchema);
