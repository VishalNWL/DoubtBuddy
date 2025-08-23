import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      match: /^[0-9]{6}$/, // adjust if not Indian pincode
    },
    location: {
      type: String,
      required: true,
    },
    contactNo: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, // allows only 10 digits
    },
    country: {
      type: String,
      required: true,
    },
    schoolId: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const School = mongoose.model("School", schoolSchema);

export default School;
