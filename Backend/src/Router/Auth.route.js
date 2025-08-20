import { Router } from "express";
import {
  RegisterUser,
  getcurrentuser,
  updateUser,
  updateAvatar,
  changePassword,
  refreshAccesstoken,
  logoutUser,
  loginUser,
  getUserById
} from '../Controllers/Auth.Controller.js';

import { jwtverify } from '../Middlewares/auth.middleware.js';
import { upload } from '../Middlewares/multer.middleware.js';

const router = Router();

// Register users (students or teachers)
router
  .route("/register")
  .post(upload.none(),
    RegisterUser
  );

// Login user
router
  .route("/login")
  .post(loginUser);

// Logout user
router
  .route("/logout")
  .post(jwtverify, logoutUser);

// Get current logged-in user
router
  .route("/current-user")
  .get(jwtverify, getcurrentuser);

//Getting user details by id
router
  .route('/user-by-id')
  .post(jwtverify,getUserById)

// Change password
router
  .route("/change-password")
  .post(jwtverify, changePassword);

// Refresh access token
router
  .route("/refresh-token")
  .post(refreshAccesstoken);

// Update avatar
router
  .route("/update-avatar")
  .post(
    jwtverify,
    updateAvatar
  );


// Update user account details
router
  .route("/update")
  .put(jwtverify, updateUser);

export default router;
