const express = require("express");
const validator = require("validator");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");

const UserModel = require("../models/users");
const OTPModel = require("../models/otp");
const { authUser, validateOTP } = require("../middleware/auth");
const { validateSignUpData } = require("../utils/validation");

const authRouter = express.Router();

const saltRounds = 10;

authRouter.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!validator.isEmail(email)) {
      throw new Error("Invalid Email!");
    }
    // const isOTPRequestExist = await OTPModel.findOne({ email });
    // if (isOTPRequestExist) {
    //   throw new Error("OTP Sent Already!");
    // }
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const OTP = new OTPModel({
      email,
      otp: otp,
    });
    await OTP.save();
    res.json({
      message: "OTP Sent to your email!",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Something Went Wrong!",
    });
  }
});

authRouter.post("/signup", async (req, res) => {
  try {
    // validate password
    validateSignUpData(req.body);

    const { password, otp, ...rest } = req.body;

    const isUserExist = await UserModel.findOne({ email: req.body.email });
    if (isUserExist) {
      throw new Error("User Already Exist! Please to login.");
    }

    const isValidOTP = await validateOTP(req);
    if (!isValidOTP) {
      throw new Error("Invalid OTP");
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);
    const user = new UserModel({ ...rest, password: hashPassword });
    const resp = await user.save();
    const token = user.createJWT();
    if (resp) {
      res.cookie("access_token", token, {
        expires: new Date(Date.now() + 24 * 3600000),
      });
      res.json({
        message: "User Created Successfully!",
        data: resp,
      });
    } else {
      res.status(400).json({
        message: "Failed To Create User!!!!",
      });
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!validator.isEmail(email)) {
      throw new Error("Invalid Email");
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordMatched = await user.isValidPassword(password);
    if (isPasswordMatched) {
      const token = user.createJWT();
      res.cookie("access_token", token, {
        expires: new Date(Date.now() + 24 * 3600000),
      });
      res.json({ message: "User Login Successful", data: user });
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  // need to do cleanup activities of app here then will logout
  res.clearCookie("access_token");
  res.json({ message: "Logout Successful" });
});

authRouter.delete("/user", authUser, async (req, res) => {
  const id = req.body._id;
  try {
    if (!id) {
      res.status(400).json({ message: "User Not Found To Delete" });
      return;
    }
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (deletedUser) {
      res.json({ message: "User deleted successfully..." });
    } else {
      res.status(400).json({ message: "User Not Found To Delete" });
    }
  } catch (error) {
    res.status(400).json({ message: "User Not Found To Delete" });
  }
});

authRouter.patch("/user", authUser, async (req, res) => {
  const { _id, ...restData } = req.body;
  const allowedFeilds = [
    "firstName",
    "lastName",
    "password",
    "age",
    "skills",
    "about",
  ];
  const isAllowedDataToUpdate = Object.keys(restData).every((key) =>
    allowedFeilds.includes(key)
  );
  try {
    if (!isAllowedDataToUpdate) {
      throw new Error(
        "Some of these feilds are not allowed to update. Please check again"
      );
    } else if (restData?.skills?.length > 10) {
      throw new Error("Max length for skill set is 10.");
    }
    const user = await UserModel.findByIdAndUpdate(_id, restData, {
      runValidators: true,
      returnOriginal: false,
    });
    res.json({ message: "User Updated Successfully!", data: user });
  } catch (error) {
    res.status(400).json({ message: "Fail to Update: " + error.message });
  }
});

module.exports = authRouter;
