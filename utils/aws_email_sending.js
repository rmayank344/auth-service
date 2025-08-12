const { SendEmailCommand } = require("aws-sdk");
const sesClient = require("./awsSes_config");
require("dotenv").config();

const response_handler = require("../utils/response_handler");

const AWSEmailCntrll = async (email, otp, otp_time, subject, html) => {
  try {
    const params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: html,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: process.env.EMAIL_USER, // must be a verified SES sender email
    };

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);

    console.log("Email sent successfully:", result);

    return {
      success: true,
      message: "Email sent successfully",
      data: result
    };
  }
  catch (err) {
    console.error("SES Email error:", err);
    return response_handler(
      res, `Something went wrong: ${err}`, 500
    )
  }
};


module.exports = { AWSEmailCntrll };