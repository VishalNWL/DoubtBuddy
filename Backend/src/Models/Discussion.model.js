import mongoose from "mongoose";
const { Schema } = mongoose;

const discussionSchema = new Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },

    // sender info
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },

    // room targeting
    school: { type: String, required: true, index: true }, // your User.school is a string
    class: { type: Number, required: true, index: true },
    batch: { type: String, required: true, index: true },

    // housekeeping
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

// TTL index: MongoDB will auto-delete when expiresAt < now
discussionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Discussion = mongoose.model("Discussion", discussionSchema);
