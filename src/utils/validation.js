const validator = require("validator");

const validateSignUpData = (data) => {
  const { password, otp, firstName, lastName, email } = data;
  if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
  if (!otp || otp.length !== 6) {
    throw new Error("Invalid OTP");
  }
  if (!firstName || !lastName || !email) {
    throw new Error("First Name is missing");
  } else if (!lastName) {
    throw new Error("Last Name is missing");
  } else if (!email) {
    throw new Error("Email is missing");
  }
};

const validateEditUserData = (req) => {
  const { user, ...restData } = req.body;
  const allowedFeilds = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "imgId",
    "skills",
    "about",
  ];
  const isAllowedDataToUpdate = Object.keys(restData).every((key) =>
    allowedFeilds.includes(key)
  );
  if (!isAllowedDataToUpdate) {
    throw new Error(
      "Some of these feilds are not allowed to update. Please check again"
    );
  } else if (JSON.parse(restData?.skills)?.length > 10) {
    throw new Error("Max length for skill set is 10.");
  }
};

const validatePasswordUpdateData = (req) => {
  const { email, newPassword } = req.body;
  if (!validator.isEmail(email)) {
    throw new Error("Invalid Email");
  } else if (!validator.isStrongPassword(newPassword)) {
    throw new Error("Please enter a strong password");
  }
};

module.exports = {
  validateSignUpData,
  validateEditUserData,
  validatePasswordUpdateData,
};
