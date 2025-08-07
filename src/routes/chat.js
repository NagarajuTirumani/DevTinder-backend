const express = require("express");
const { authUser } = require("../middleware/auth");
const { Chat } = require("../models/chat");
const { getSignedUrlFromImgId } = require("../utils/common");

const chatRouter = express.Router();

chatRouter.post("/chat", authUser, async (req, res) => {
  const { toUserId } = req.body;
  const currentUser = req.user;
  try {
    const chats = await Chat.findOne({
      participants: { $all: [toUserId, currentUser._id] },
    }).populate("participants", ["imgId", "firstName", "lastName"]);

    let chatDoc = chats.toObject();

    if (!chats) {
      throw new Error("No Chats Found!!!")
    }

    if (chatDoc.participants) {
      chatDoc.participants = await Promise.all(
        chatDoc.participants.map(async (participant) => {
          if (participant.imgId) {
            const imgUrl = await getSignedUrlFromImgId(participant);
            return { ...participant, imgUrl };
          }
          return participant;
        })
      );
    }
    res.json({
      message: "Messages Fetched",
      data: chatDoc,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
      data: [],
    });
  }
});

module.exports = chatRouter;
