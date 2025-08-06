const { Server } = require("socket.io");
const { generateRoomId } = require("./common");
const { Chat } = require("../models/chat");

const createSocketConnections = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    socket.on("join-room", (response) => {
      const { fromUserId, toUserId } = response;
      const roomId = generateRoomId(fromUserId, toUserId);
      socket.join(roomId);
    });

    socket.on("send-message", async (response) => {
      const { fromUserId, toUserId, message } = response;
      const roomId = generateRoomId(fromUserId, toUserId);
      try {
        let chat = await Chat.findOne({
          participants: { $all: [fromUserId, toUserId] },
        });
        if (!chat) {
          chat = new Chat({
            participants: [fromUserId, toUserId],
            messages: [],
          });
        }
        chat.messages.push({
          fromUserId: fromUserId,
          message: message,
        });
        await chat.save();
        io.to(roomId).emit("send-message", response);
      } catch (err) {
        console.log("err", err);
      }
    });
  });
};

module.exports = { createSocketConnections };
