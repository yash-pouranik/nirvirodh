const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Team = require("./teamInfo");

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

module.exports = mongoose.model("Project", projectSchema);
