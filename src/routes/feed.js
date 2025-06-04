const express = require("express");
const UserModel = require("../models/users");
const { authUser } = require("../middleware/auth");

const feedRouter = express.Router();

feedRouter.get("/feed", authUser, async (req, res) => {
  try {
    const users = await UserModel.find({
      email: { $not: { $eq: req.body.user.email } },
    });
    res.json({
      message: "fetched users successfully",
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      message: "Something went wrong while getting users list",
      data: null,
    });
  }
});

module.exports = feedRouter;
