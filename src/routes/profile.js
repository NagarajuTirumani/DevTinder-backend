const express = require("express");

const { authUser } = require("../middleware/auth");
const { validateEditUserData } = require("../utils/validation");
const UserModel = require('../models/users');

const profileRouter = express.Router();

profileRouter.get("/profile/view", authUser, async (req, res) => {
  try {
    const { user } = req.body;
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

profileRouter.patch("/profile/edit", authUser, async (req, res) => {
  try {
    validateEditUserData(req);
    const { user, ...restData } = req.body;
    Object.keys(restData).forEach((key) => user[key] = req.body[key]);
    await user.save();
    res.json({
      message: 'User Updated',
      data: user,
    })
  } catch (error) {
    res.status(500).send("Fail to Update: " + error.message);
  }
});

module.exports = profileRouter;
