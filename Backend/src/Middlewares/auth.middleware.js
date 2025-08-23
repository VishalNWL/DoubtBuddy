import { ApiError } from "../Utils/Apierrors.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";
import School from "../Models/School.model.js"; // 👈 import School model

const jwtverify = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Access");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // First check in User collection
    let account = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (account) {
      req.user = account; // 👈 attach user
      return next();
    }

    // If not found in User, check in School
    account = await School.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (account) {
      req.school = account; // 👈 attach school
      return next();
    }

    // If neither user nor school found
    throw new ApiError(404, "Invalid user or school");

  } catch (error) {
    console.error("JWT Verify Error:", error.message);
    throw new ApiError(401, "Unauthorized or invalid token");
  }
});

export { jwtverify };
