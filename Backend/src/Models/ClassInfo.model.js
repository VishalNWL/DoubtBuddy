import mongoose from "mongoose";

const classInfoSchema = new mongoose.Schema({
  school: { type: String, required: true },
  class: { type: String, required: true },

  subjects: [{ type: String, required: true }]
});

export const ClassInfo = mongoose.model("ClassInfo", classInfoSchema);
