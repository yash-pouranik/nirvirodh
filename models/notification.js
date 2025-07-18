const mongoose = require("mongoose");
const Team = require("./teamInfo");
const User = require("./user")

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // team leader
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who requested to join
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  type: { type: String, default: "join_request" }, // for future use
  status: { type: String, enum: ["pending", "accepted", "rejected", "markedAsRead"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
