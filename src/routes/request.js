const express = require("express");

const { authUser } = require("../middleware/auth");
const RequestModel = require("../models/request");
const UserModel = require("../models/users");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  authUser,
  async (req, res) => {
    try {
      const currentUser = req.body.user;
      const fromUserId = currentUser._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        throw new Error(`${status} is Invalid Status`);
      }
      const toUser = await UserModel.findById({ _id: toUserId });
      if (!toUser) {
        throw new Error(`Requesting User Not Exist!`);
      }

      const requestResponse = await RequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (requestResponse) {
        throw new Error("Request Already Exists!");
      }

      const request = new RequestModel({
        status,
        toUserId,
        fromUserId,
      });
      await request.save();
      res.send({
        message: "request sent successfully",
        data: request,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
        data: null,
      });
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  authUser,
  async (req, res) => {
    try {
      const currentUser = req.body.user;
      const { status, requestId } = req.params;
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid Status");
      }
      const request = await RequestModel.findOne({
        _id: requestId,
        toUserId: currentUser._id,
        status: "interested",
      });
      if (!request) {
        throw new Error("Request Not Found!");
      }
      request.status = status;
      await request.save();
      res.json({
        message: status + " successfully",
        data: request,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = requestRouter;
