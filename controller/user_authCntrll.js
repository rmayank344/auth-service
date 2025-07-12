const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
const auth_configs = require("../config/auth_config.json");

// Import Middleware
const { generate_public_token } = require("../middleware/authentication");

// Import Utils
const response_handler = require("../utils/response_handler");
const { password_hashed, comparePassword } = require("../utils/password_verified");
const { awsFileUpload, awsFileFetch } = require("../utils/aws_file_uploader");


// Import Model
const USERMODEL = require("../models/user_model");

/**
 * 
 * ENDPOINT : /api/user/v1/auth-service/signup
 * Table used : user_model
 * 
 */

const user_signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return response_handler.send_error_response(
        res, "Email and Password are required.", 404
      )
    }
    const api_key = req.header('x-api-key');
    if (!api_key) {
      return response_handler.send_error_response(
        res, "Api key is missing", 404
      )
    }

    const check_email = await USERMODEL.findOne({ where: { email: email }, attributes: ['email'], raw: true });
    if (check_email) return response_handler.send_error_response(res, "Email already exits.", 400);
    const hashedPassword = await password_hashed(password);
    const auth_config = auth_configs[api_key];
    let public_token = null;
    try {
      public_token = await generate_public_token(req, res);
      if (public_token) {
        const create_user = await USERMODEL.create({
          email: email,
          password: hashedPassword,
          role: auth_config.role,
        });
      }
    }
    catch (err) {
      return response_handler.send_error_response(
        res, "Public Token not created.", 403
      )
    }

    return response_handler.send_success_response(
      res, { message: "user signup successfully.", public_token: public_token }, 201
    )
  }
  catch (err) {
    console.log(err);
    if (process.env.DEPLOYMENT == 'prod') {
      return response_handler.send_error_response(
        res, 'Something went wrong', 500
      )
    } else {
      return response_handler.send_error_response(
        res, `Something went wrong: ${err}`, 500
      )
    }
  }
};

/**
 * 
 * ENDPOINT : /api/user/v1/auth-service/login
 * Table used : user_model
 * 
 */

const user_login = async (req, res) => {
  try {
    const api_key = req.header('x-api-key');
    if (!api_key) {
      return response_handler.send_error_response(
        res, "Api key is missing", 404
      );
    }
    const { email, password } = req.body;
    if (!email || !password) {
      return response_handler.send_error_response(
        res, "Email and Password are required.", 404
      )
    }
    const user = await USERMODEL.findOne({ where: { email: email }, raw: true });
    if (!user) {
      const SIGNUP_URL = `${process.env.AUTH_SERVICE_HOST}/api/user/${process.env.AUTH_SERVICE_VERSION}/auth-service/signup`;
      return response_handler.send_error_response(
        res,
        "User not found. Please signup.",
        400,
        { signup_url: SIGNUP_URL }
      );
    }
    const auth_config = auth_configs[api_key];
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) return response_handler.send_error_response(res, "Login credentials wrong.", 400);
    else {
      let token_payload = null;
      let auth_token = null;
      let refresh_token = null;
      token_payload = {
        id: user.user_id,
        email: user.email,
        role: user.role,
      };
      auth_token = jwt.sign(token_payload, auth_config.secret_key_auth, { expiresIn: process.env.ACCESS_AUTH_TOKEN_EXPIRES_IN });
      refresh_token = jwt.sign(token_payload, auth_config.secret_key_refresh, { expiresIn: process.env.ACCESS_REFRESH_TOKEN_EXPIRES_IN });
      return response_handler.send_success_response(
        res, { message: "user loggin successfully.", "auth_token": auth_token, "refresh_token": refresh_token }, 200
      );
    }
  }
  catch (err) {
    if (process.env.DEPLOYMENT == 'prod') {
      return response_handler.send_error_response(
        res, 'Something went wrong', 500
      )
    } else {
      return response_handler.send_error_response(
        res, `Something went wrong: ${err}`, 500
      )
    }
  }
};

/**
 * 
 * ENDPOINT : /api/user/v1/auth-service/edit-profile
 * Table used : user_model
 * 
 */
const user_edit_profile = async (req, res) => {
  try {
    const { name, gender, file_name, image_url, dob, country_code, phone } = req.body;
    let image_key = null;
    if (file_name && image_url) {
      image_key = await awsFileUpload(file_name, image_url, process.env.S3_BUCKET_NAME);
    }

    const user_profile = await USERMODEL.update(
      {
        name: name,
        gender: gender,
        dob: dob,
        country_code: country_code,
        phone: phone,
        profile_url: image_key || null
      },
      {
        where: {
          user_id: req.id,
          is_active: 1
        },
      }
    );
    if (user_profile) {
      return response_handler.send_success_response(res, "Profile updated successfully.", 202);
    }
  }
  catch (err) {
    if (process.env.DEPLOYMENT == 'prod') {
      return response_handler.send_error_response(
        res, 'Something went wrong', 500
      )
    } else {
      return response_handler.send_error_response(
        res, `Something went wrong: ${err}`, 500
      )
    }
  }
};

/**
 * 
 * ENDPOINT : /api/user/v1/auth-service/get-profile
 * Table used : user_model
 * 
 */
const get_user_all_profile = async (req, res) => {
  try {
    const userId = req.id;
    const user_data = await USERMODEL.findOne({ where: { user_id: userId, is_active: true }, raw: true });
    let image_data;
    if (user_data.profile_url != null) {
       image_data = await awsFileFetch(user_data.profile_url, process.env.S3_BUCKET_NAME);
      user_data.profile_url = {
        static_url: image_data.static_url,
        signed_url: image_data.signed_url,
      };
    }
    return response_handler.send_success_response(res, user_data, 200);
  }
  catch (err) {
    if (process.env.DEPLOYMENT == 'prod') {
      return response_handler.send_error_response(
        res, 'Something went wrong', 500
      )
    } else {
      return response_handler.send_error_response(
        res, `Something went wrong: ${err}`, 500
      )
    }
  }
};

/**
 * 
 * ENDPOINT : /api/user/v1/auth-service/refresh-auth-token
 * Table used : 
 * 
 */

const refresh_auth_token = async (req, res) => {
  try {
    const customer_api_key = req.header('cust-x-api-key');
    if (!customer_api_key){
      return response_handler.send_error_response(
        res, "Customer Api key is missing", 404
      )
    }
    const auth_config = auth_configs[customer_api_key];

    const { user_refresh_token } = req.body;
    if (!user_refresh_token) {
      return response_handler.send_error_response(
        res, "Refresh token is missing", 404
      )
    }
    try {
      const verified_refresh_token = jwt.verify(user_refresh_token, auth_config.secret_key_refresh);
      const new_payload = {
        id: verified_refresh_token.id,
        email: verified_refresh_token.email,
        role: verified_refresh_token.role
      };

      const new_access_token = jwt.sign(
        new_payload,
        auth_config.secret_key_auth,
        { expiresIn: process.env.ACCESS_AUTH_TOKEN_EXPIRES_IN }
      );
      return response_handler.send_success_response(
        res,
        { "auth_token": new_access_token },
        200
      )
    }
    catch (err) {
      return response_handler.send_error_response(
        res, "Invalid or Expired refresh token.", 403
      )
    }
  }
  catch (err) {
    if (process.env.DEPLOYMENT == 'prod') {
      return response_handler.send_error_response(
        res, 'Something went wrong', 500
      )
    } else {
      return response_handler.send_error_response(
        res, `Something went wrong: ${err}`, 500
      )
    }
  }
};

module.exports = { user_signup, user_login, user_edit_profile, get_user_all_profile, refresh_auth_token };