const express = require("express");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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
  "imgId",
];

const {
  AWS_BUCKET_REGION,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
} = process.env;

const client = new S3Client({
  region: AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

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
        const command = new GetObjectCommand({
          Bucket: AWS_BUCKET_NAME,
          Key: user.imgId,
        });
        const imgUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
        return { ...user, imgUrl };
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
