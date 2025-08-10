const express = require('express');
const router = new express.Router();

// Utils
const {validateFileType} = require("../utils/validate_file_type");
const {reset_password_otp_validate} = require("../utils/otp_related_file");

// Middlerware
const { validate_refresh_token, validate_auth_token, admin_access} = require("../middleware/authentication");

// User Controller
const {
  user_signup,
  user_login, 
  user_edit_profile, 
  get_user_all_profile, 
  refresh_auth_token, 
  user_forget_password_via_otp,
  reset_password_via_otp,
  user_forget_password_via_hashing,
  reset_password_via_hashing,
  user_add_address,
  get_add_address,
  get_user_detail
} = require("../controller/user_authCntrll");


// user routes
router.post("/signup", user_signup);
router.get("/login", user_login);
router.put("/edit-profile", validate_auth_token, validate_refresh_token, validateFileType, user_edit_profile);
router.get("/get-me-profile", validate_auth_token, validate_refresh_token, get_user_all_profile);
router.post("/refresh-auth-token", validate_auth_token, validate_refresh_token, admin_access, refresh_auth_token);
router.post("/otp-forget-password", user_forget_password_via_otp);
router.post("/otp-reset-password", reset_password_via_otp);
router.post("/hash-forget-password",user_forget_password_via_hashing);
router.post("/hash-reset-password",reset_password_via_hashing);
router.post("/otp-validate", reset_password_otp_validate);
router.post("/add-address", validate_auth_token, validate_refresh_token, user_add_address);
router.get("/get-address", validate_auth_token, validate_refresh_token, get_add_address);
router.post("/get-user", validate_auth_token, validate_refresh_token, get_user_detail);

module.exports = router;