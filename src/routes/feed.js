const express = require("express");

const UserModel = require("../models/users");
const { authUser } = require("../middleware/auth");
const RequestModel = require("../models/request");
const { getSignedUrlFromImgId } = require("../utils/common");

const feedRouter = express.Router();

const REQUIRED_FEILDS = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "skills",
  "about",
  "imgId",
];

feedRouter.get("/user/requests/pending", authUser, async (req, res) => {
  try {
    const currentUser = req.body.user;
    const requests = await RequestModel.find({
      toUserId: currentUser._id,
      status: "interested",
    }).populate("fromUserId", REQUIRED_FEILDS);

    const updatedRequests = await Promise.all(
      requests.map(async (request) => {
        if (!request?.fromUserId?.imgId) return request;
        const imgUrl = await getSignedUrlFromImgId(request.fromUserId);
        const requestObj = request.toObject();
        return {
          ...requestObj,
          fromUserId: {
            ...request.fromUserId.toObject(),
            imgUrl,
          },
        };
      })
    );

    res.json({
      message: "fetching connections successfully!",
      data: updatedRequests,
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

    const updatedUsers = await Promise.all(
      data.map(async (connection) => {
        if (!connection.imgId) return connection;
        const imgUrl = await getSignedUrlFromImgId(connection);
        return { ...connection.toObject(), imgUrl };
      })
    );

    res.json({
      message: "fetched connections successfully",
      data: updatedUsers,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

feedRouter.get("/user/feed", authUser, async (req, res) => {
  try {
    const currentUser = req.body.user;

    let { page = 1, limit = 10 } = req.query;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await RequestModel.find({
      $or: [{ toUserId: currentUser._id }, { fromUserId: currentUser._id }],
    });

    const connectionsSet = new Set();

    connectionRequests.map((request) => {
      connectionsSet.add(request.fromUserId.toString());
      connectionsSet.add(request.toUserId.toString());
    });

    const users = await UserModel.find({
      _id: { $nin: Array.from(connectionsSet) },
      email: { $not: { $eq: req.body.user.email } },
    })
      .select(REQUIRED_FEILDS)
      .skip(skip)
      .limit(limit);

    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        if (!user.imgId) return user;
        const imgUrl = await getSignedUrlFromImgId(user);
        return { ...user.toObject(), imgUrl };
      })
    );

    res.json({
      message: "fetched users successfully",
      data: updatedUsers,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      data: null,
    });
  }
});

module.exports = feedRouter;
