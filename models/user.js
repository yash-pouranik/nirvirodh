const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Team = require("./teamInfo");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  teamsJoined: [
    {
      type: Schema.Types.ObjectId,
      ref: "Team"  // 🔁 Correct ref name
    }
  ]
});



userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model("User", userSchema);
