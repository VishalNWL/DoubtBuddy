import mongoose from "mongoose";

const classInfoSchema = new mongoose.Schema({
  school: { type: String, required: true },

  // class 5 — 12
  class: { type: Number, required: true },

  // null for 5–10
  stream: { type: String, default: null },

  subjects: [{ type: String, required: true }],

  OptionalSubjects: [{ type: String}]
});

export const ClassInfo = mongoose.model("ClassInfo", classInfoSchema);
