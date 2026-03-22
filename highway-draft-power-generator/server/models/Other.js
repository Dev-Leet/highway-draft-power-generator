const mongoose = require("mongoose");

const AdminNoteSchema = new mongoose.Schema(
  { observation: { type: String, required: true, trim: true } },
  { timestamps: true }
);

const FeedbackSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports.AdminNote = mongoose.model("AdminNote", AdminNoteSchema);
module.exports.Feedback = mongoose.model("Feedback", FeedbackSchema);
