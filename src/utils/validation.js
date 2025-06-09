const validator = require("validator");

const validateSignUpData = (data) => {
  const { password } = data;
  if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
};

const validateEditUserData = (req) => {
  const { user, ...restData } = req.body;
  const allowedFeilds = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "imgUrl",
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
  } else if (restData?.skills?.length > 10) {
    throw new Error("Max length for skill set is 10.");
  }
};

const validatePasswordUpdateData = (req) => {
  const { email, newPassword } = req.body;
  if (!validator.isEmail(email)) {
    throw new Error('Invalid Email');
  } else if (!validator.isStrongPassword(newPassword)){
    throw new Error("Please enter a strong password");
  }
};

module.exports = {
  validateSignUpData,
  validateEditUserData,
  validatePasswordUpdateData,
};
