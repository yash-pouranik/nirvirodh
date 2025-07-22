const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  githubURL: {
    type: String,
    required: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  lastEditedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// ✅ Define compound unique index *outside* the schema definition
fileSchema.index({ fileName: 1, project: 1 }, { unique: true });


module.exports = mongoose.model("File", fileSchema);
