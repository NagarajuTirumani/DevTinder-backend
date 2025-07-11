const jwt = require("jsonwebtoken");

const UserModel = require("../models/users");
const OTPModel = require("../models/otp");

const authUser = async (req, res, next) => {
  const { access_token } = req.cookies;

  try {
    if (!access_token) {
      return res.status(401).json({ message: "Please login first." });
    }

    const { JWT_SECRET_AUTH_KEY } = process.env;

    const decodedUser = jwt.verify(access_token, JWT_SECRET_AUTH_KEY);
    const { _id } = decodedUser;
    const user = await UserModel.findById({ _id });
    if (!user) {
      throw new Error("User Not Found!");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const validateOTP = async (req) => {
  const { email, otp } = req.body;
  const response = await OTPModel.find({ email })
    .sort({ createdAt: -1 })
    .limit(1);
  if (response.length === 0 || otp !== response[0].otp) {
    return false;
  }
  return true;
};

module.exports = {
  authUser,
  validateOTP,
};
