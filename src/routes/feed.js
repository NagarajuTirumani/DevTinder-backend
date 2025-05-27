const express = require("express");
const UserModel = require("../models/users");
const { authUser } = require('../middleware/auth');

const feedRouter = express.Router();

feedRouter.get("/feed", authUser, async (req, res) => {
  try {
    const users = await UserModel.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send("Something went wrong while getting users list");
  }
});

module.exports = feedRouter;
