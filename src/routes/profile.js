const express = require("express");
const bcrypt = require("bcrypt");

const { authUser } = require("../middleware/auth");
const {
  validateEditUserData,
  validatePasswordUpdateData,
} = require("../utils/validation");
const UserModel = require("../models/users");
const { getSignedUrlFromImgId } = require("../utils/common");

const saltRounds = 10;

const profileRouter = express.Router();

profileRouter.get("/profile/view", authUser, async (req, res) => {
  try {
    const { user } = req.body;
    let updatedUser;
    if (!user.imgId){
      updatedUser = user;
    } else {
      const imgUrl = await getSignedUrlFromImgId(user);
      updatedUser = { ...user.toObject(), imgUrl };
    }
    res.json({ message: "Fetched Profile Successfully!", data: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

profileRouter.patch("/profile/edit", authUser, async (req, res) => {
  try {
    validateEditUserData(req);
    const { user, ...restData } = req.body;
    Object.keys(restData).forEach((key) => (user[key] = req.body[key]));
    await user.save();
    res.json({
      message: "User Updated",
      data: user,
    });
  } catch (error) {
    res.status(400).json({ message: "Fail to Update: " + error.message });
  }
});

profileRouter.patch("/profile/password", async (req, res) => {
  const { email, password, newPassword } = req.body;
  try {
    validatePasswordUpdateData(req);
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("Invalid User Credentials");
    }
    const isPasswordMatched = await user.isValidPassword(password);
    if (!isPasswordMatched) {
      throw new Error("Invalid User Credentials");
    }
    user.password = await bcrypt.hash(newPassword, saltRounds);
    await user.save();
    res.json({
      message: "User Updated",
      data: user,
    });
  } catch (error) {
    res.status(400).json({ message: "Fail to Update: " + error.message });
  }
});

module.exports = profileRouter;
