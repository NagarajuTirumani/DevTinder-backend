const validator = require("validator");

const validateSignUpData = (data) => {
  const { password } = data;
  if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
};

module.exports = {
  validateSignUpData,
};
