// Function to send success response
exports.send_success_response = (res, data, status_code = 200, extra = {}) => {
  res.status(status_code).json({
    success: true,
    data: data,
  });
};

// Function to send error response
exports.send_error_response = (res, error_message, status_code, extra = {}) => {
  res.status(status_code).json({
    success: false,
    error: error_message,
    ...extra,
  });
};