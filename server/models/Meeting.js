import mongoose from "mongoose";

const action_schema = new mongoose.Schema({
  title: { type: String, required: true },
  assignee: { type: String, default: "Unassigned" },
  deadline: { type: Date, default: null },
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" }
}, { _id: true });

const meeting_schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  meeting_date: { type: Date, default: Date.now },
  audio_path: { type: String, default: "" },
  transcript: { type: String, default: "" },
  summary: { type: String, default: "" },
  discussion_points: [{ type: String }],
  decisions: [{ type: String }],
  action_items: [action_schema],
  status: { type: String, enum: ["Created", "Processing", "Completed", "Failed"], default: "Created" }
}, { timestamps: true });

export default mongoose.model("Meeting", meeting_schema);
