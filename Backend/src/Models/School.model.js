import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const schoolSchema = new Schema(
  {
    schoolName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
pincode: {
  type: String,
  required: true,
  trim: true,
  match: [/^[A-Za-z0-9\- ]{3,10}$/, "Invalid postal code"]
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
      unique: true,
      trim: true,
    },
    classes: [
      {
        class: { type: Number, required: true },
        batches: [String]
      } 
    ],
    OptionalSubjects: [
      {
        stream: { type: String },
        subjects: [String]
      }
    ],
    password: { 
      type: String,
      required: true,
      minlength: 6,
    },
    forget_password_otp: {
      type: String,
      default: null
    },
    forget_password_expiry: {
      type: Date,
      default: ""
    },


    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// 🔹 Pre-save hook for hashing password
schoolSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔹 Compare entered password with hashed password
schoolSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 🔹 Generate Access Token
schoolSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      schoolId: this.schoolId,
      schoolName: this.schoolName,
      contactNo: this.contactNo,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// 🔹 Generate Refresh Token
schoolSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const School = mongoose.model("School", schoolSchema);

export default School;
