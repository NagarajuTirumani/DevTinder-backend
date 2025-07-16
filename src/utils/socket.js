const { Server } = require("socket.io");
const { generateRoomId } = require("./common");

const createSocketConnections = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    socket.on("join-room", (response) => {
      const { currentUserId, toUserId } = response;
      const roomId = generateRoomId(currentUserId, toUserId);
      socket.join(roomId);
    });

    socket.on("send-message", (response) => {
      const { currentUserId, toUserId } = response;
      const roomId = generateRoomId(currentUserId, toUserId);
      io.to(roomId).emit("send-message", response);
    });
  });
};

module.exports = { createSocketConnections };
