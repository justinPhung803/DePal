import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: { type: String },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Matched users
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
