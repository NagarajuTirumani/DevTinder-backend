const express = require("express");

const UserModel = require("../models/users");
const { authUser } = require("../middleware/auth");
const RequestModel = require("../models/request");

const feedRouter = express.Router();

const REQUIRED_FEILDS = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "skills",
  "about",
];

feedRouter.get("/user/requests/pending", authUser, async (req, res) => {
  try {
    const currentUser = req.body.user;
    const requests = await RequestModel.find({
      toUserId: currentUser._id,
      status: "interested",
    }).populate("fromUserId", REQUIRED_FEILDS);

    res.json({
      message: "fetching connections successfully!",
      data: requests,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

feedRouter.get("/user/connections", authUser, async (req, res) => {
  try {
    const currentUser = req.body.user;

    const connections = await RequestModel.find({
      status: "accepted",
      $or: [{ toUserId: currentUser._id }, { fromUserId: currentUser._id }],
    })
      .populate("fromUserId", REQUIRED_FEILDS)
      .populate("toUserId", REQUIRED_FEILDS);

    const data = connections.map((connection) => {
      if (connection.fromUserId._id.equals(currentUser._id)) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    res.json({
      message: "fetched connections successfully",
      data: data,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

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
