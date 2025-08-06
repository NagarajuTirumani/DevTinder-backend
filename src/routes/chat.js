const express = require("express");
const { authUser } = require("../middleware/auth");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.post("/chat", authUser, async (req, res) => {
  const { toUserId } = req.body;
  const currentUser = req.user;
  try {
    const chats = await Chat.findOne({
      participants: { $all: [toUserId, currentUser._id] },
    });
    res.json({
      message: "Messages Fetched",
      data: chats,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

module.exports = chatRouter;
