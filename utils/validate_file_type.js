const response_handler = require("../utils/response_handler");

const validateFileType = async (req, res, next) => {
  const { file_name } = req.body;

  if (file_name) {
    const ext = file_name.split('.').pop().toLowerCase();
    const allowed = ['png', 'jpg', 'jpeg', 'pdf', 'mp4'];

    if (!allowed.includes(ext)) {
      return response_handler.send_error_response(res, "Only PNG, JPG, JPEG, MP4 and PDF files are allowed.", 404);
    }
  }
  next();
};

module.exports = { validateFileType };