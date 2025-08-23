import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";
import School from "../Models/School.model.js";

export const socketAuth = async (socket, next) => {
  try {
    // token can be passed from frontend as: io("url", { auth: { token } })
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized Access: No token"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // First check in User collection
    let account = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (account) {
      socket.user = account; // attach user to socket
      return next();
    }

    // If not found in User, check in School
    account = await School.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (account) {
      socket.school = account; // attach school
      return next();
    }

    return next(new Error("Invalid user or school"));
  } catch (error) {
    console.error("SocketAuth Error:", error.message);
    return next(new Error("Unauthorized or invalid token"));
  }
};
