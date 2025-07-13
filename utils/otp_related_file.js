const crypto = require('crypto');
const bcrypt = require('bcrypt');
const response_handler = require("../utils/response_handler");

// Import Model
const USERMODEL = require("../models/user_model");

const generateSecureOTP = async () => {
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
};

/**
 * 
 * ENDPOINT : /api/user/v1/auth-service/otp-validate
 * Table used : 
 * 
 */
const reset_password_otp_validate = async (req, res) => {
  const reset_password_link = `${process.env.AUTH_SERVICE_HOST}/api/user/${process.env.AUTH_SERVICE_VERSION}/auth-service/otp-reset-password`;
  try {
    const { email, otp } = req.body;
    const user = await USERMODEL.findOne({ where: { email: email }, attributes: ['email', 'user_id', 'otp', 'otp_expiry'], raw: true });
    if (!user) return response_handler.send_error_response(res, "Invalid user.", 400);
    let user_update;
    const isOtpExpired = new Date() > user.otp_expiry;
    if (isOtpExpired) {
      user_update = await USERMODEL.update(
        { otp: null, otp_expiry: null },
        {
          where: {
            user_id: user.user_id,
            otp: user.otp
          }
        }
      );
      return response_handler.send_error_response(res, "OTP expired.", 400);
    }

    if (user.otp === otp) {
      user_update = await USERMODEL.update(
        { otp: null, otp_expiry: null },
        {
          where: {
            user_id: user.user_id,
            otp: user.otp
          }
        }
      );
      if (user_update) return response_handler.send_success_response(res, { "email:": user.email, "reset_password_link:": reset_password_link }, 200);
    }
    return response_handler.send_error_response(res, "Invalid OTP.", 400);
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


module.exports = { generateSecureOTP, reset_password_otp_validate };