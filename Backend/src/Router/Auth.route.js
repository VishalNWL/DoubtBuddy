import { Router } from "express";
import {
  RegisterUser,
  getCurrentAccount,
  updateUser,
  updateAvatar,
  changePassword,
  refreshAccesstoken,
  logoutUser,
  loginUser,
  getUserById,
  gettingPendingUser,
  changestatus,
  registerSchool,
  changeSchoolStatus, 
  gettingPendingSchool,
  loginSchool,
  getCurrentSchool
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
  .get(jwtverify, getCurrentAccount);

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

router
.route('/get-pending-user')
.get(jwtverify,gettingPendingUser);

router
.route('/changestatus')
.post(jwtverify,changestatus);

router
.route('/registerschool')
.post(registerSchool);

router
.route('/changeschoolstatus')
.post(jwtverify,changeSchoolStatus);

router
.route('/pendingschool')
.get(jwtverify,gettingPendingSchool);

router
.route('/loginschool')
.post(loginSchool)

router 
.route('/currentschool')
.get(getCurrentSchool)


export default router;
