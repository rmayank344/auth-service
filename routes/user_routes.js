const express = require('express');
const router = new express.Router();

// Utils
const {validateFileType} = require("../utils/validate_file_type");

// Middlerware
const { validate_refresh_token, validate_auth_token, admin_access} = require("../middleware/authentication");

// User Controller
const {user_signup, user_login, user_edit_profile, get_user_all_profile, refresh_auth_token} = require("../controller/user_authCntrll");


// user routes
router.post("/signup", user_signup);
router.get("/login", user_login);
router.put("/edit-profile", validate_auth_token, validate_refresh_token, validateFileType, user_edit_profile);
router.get("/get-all-profile", validate_auth_token, validate_refresh_token, get_user_all_profile);
router.post("/refresh-auth-token", validate_auth_token, validate_refresh_token, admin_access, refresh_auth_token);


module.exports = router;