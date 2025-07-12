const bcrypt = require('bcrypt');
const response_handler = require("../utils/response_handler");

const password_hashed = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 15);
  return hashedPassword;
};

const comparePassword = async (password, user_password) => {
  const checkPassword = await bcrypt.compare(password,user_password);
  if(checkPassword) return true;
  return false;
};


module.exports = {password_hashed, comparePassword}