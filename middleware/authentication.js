const jwt = require('jsonwebtoken');
require('dotenv').config();
const auth_configs = require("../config/auth_config.json");
const response_handler = require("../utils/response_handler");

// Generate Public Token
const generate_public_token = async (req, res) => {
  try {
    const api_key = req.header('x-api-key');
    if (!api_key) {
      return response_handler.send(
        res, "Api key is missing", 404
      );
    }
    const auth_config = auth_configs[api_key];
    const public_token = jwt.sign({ role: auth_config.role }, auth_config.secret_key_public, { expiresIn: process.env.ACCESS_AUTH_TOKEN_EXPIRES_IN });
    return public_token;
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

// Validate Public Token
const validate_public_token = async (req, res, next) => {
  try {
    const api_key = req.header('x-api-key');
    if (!api_key) {
      return response_handler.send_error_response(
        res, "Api key is missing", 404
      )
    }
    const auth_config = auth_configs[api_key];
    const public_token = req.header('x-public-token');
    if (!public_token) {
      return response_handler.send_error_response(
        res, "Public token is missing", 404
      )
    }

    try {
      const verified_public_token = jwt.verify(public_token, auth_config.secret_key_public);
      if (verified_public_token.role != 'customer') {
        return response_handler.send_error_response(
          res, "Only Customer can login this page.", 400
        )
      }
    }
    catch (err) {
      return response_handler.send_error_response(
        res, 'Unauthorised public token', 401
      )
    }
    next();
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

// Validate Refresh Token
const validate_refresh_token = async (req, res, next) => {
  const LoginUrl = `${process.env.AUTH_SERVICE_HOST}/api/user/${process.env.AUTH_SERVICE_VERSION}/auth-service/login`;
  try {
    const api_key = req.header('x-api-key');
    if (!api_key) {
      return response_handler.send_error_response(
        res, "Api key is missing", 404
      )
    }
    const refresh_token = req.header('x-refresh-token');
    if (!refresh_token) {
      return response_handler.send_error_response(
        res, "Refresh token is missing", 404
      )
    }

    try {
      const verified_refresh_token = jwt.verify(refresh_token, auth_configs[api_key].secret_key_refresh);
      req.id = verified_refresh_token.id,
        req.email = verified_refresh_token.email,
        req.role = verified_refresh_token.role
      return next();
    }
    catch (err) {
      if (err.name === "TokenExpiredError") {
        return response_handler.send_error_response(
          res,
          "Refresh token has expired. Please login in again.",
          401,
          { Login_url: LoginUrl }
        );
      }
      return response_handler.send_error_response(
        res, 'Unauthorised Refresh token', 401
      )
    }
  }
  catch (err) {
    console.log(err)
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

// Validate Auth Token
const validate_auth_token = async (req, res, next) => {
  const REFRESH_AUTH_TOKEN_URL = `${process.env.AUTH_SERVICE_HOST}/api/user/${process.env.AUTH_SERVICE_VERSION}/auth-service/refresh-auth-token`;
  try {
    const api_key = req.header('x-api-key');
    if (!api_key) {
      return response_handler.send_error_response(
        res, "Api key is missing", 404
      );
    }

    const auth_token = req.header('x-auth-token');
    if (!auth_token) {
      return response_handler.send_error_response(
        res, "Auth Token is missing", 404
      );
    }
    try {
      const verified_auth_token = jwt.verify(auth_token, auth_configs[api_key].secret_key_auth);
      req.id = verified_auth_token.id,
        req.email = verified_auth_token.email,
        req.role = verified_auth_token.role
    }
    catch (err) {
      if (err.name === "TokenExpiredError") {
        return response_handler.send_error_response(
          res,
          "Auth token has expired. Please click on url.",
          401,
          { refresh_auth_token_url: REFRESH_AUTH_TOKEN_URL }
        );
      }
      return response_handler.send_error_response(
        res, 'Unauthorised auth token', 401
      )
    }
    next();
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

// verified user role
const admin_access = async (req, res, next) => {
  try {
    if (req.role === 'customer') {
      return response_handler.send_error_response(
        res, "Only Admin can access this page.", 400
      )
    }
    next();
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

module.exports = { generate_public_token, validate_public_token, validate_refresh_token, validate_auth_token, admin_access };