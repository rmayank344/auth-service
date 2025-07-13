const { sendEmail } = require("./email_config");


// Password Reset Link Send On Email 
const sendResetPasswordLink = async (email, reset_token, token_time) => {
  const hash_password_link = `${process.env.AUTH_SERVICE_HOST}/api/user/${process.env.AUTH_SERVICE_VERSION}/auth-service/hash-reset-password?${process.env.AUTH_PASSWORD_TOKEN_KEY}=${reset_token}`;
  const subject = "Reset your password";
  const html = `
    <p>Hi,</p>
    <p>Click the link below to reset your password:</p>
    <a href="${hash_password_link}">${hash_password_link}</a>
    <p>"This link will expire in ${token_time} minutes."</p>
  `;
  try {
    const email_detail = await sendEmail(email, subject, html);
    return "Email sent successfully";
  } catch (err) {
    return "Failed to send email";
  }
};

//Password Validate OTP Send On Email
const sendResetPasswordOtp = async (email, otp, otp_time) => {
  const subject = "Your OTP for Password Reset";
  const html = `
    <p>Hi,</p>
    <p>Your OTP is <b>${otp}</b>. It will expire in ${otp_time} minutes.</p>
    <p>If you didn't request this, please ignore.</p>
  `;
  try {
    const email_detail = await sendEmail(email, subject, html);
    return "Email sent successfully";
  } catch (err) {
    return "Failed to send email";
  }
};


module.exports = { sendResetPasswordLink, sendResetPasswordOtp };