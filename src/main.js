require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const { createServer } = require("http");
const cors = require("cors");

require("./utils/remainder");

const { connectDB } = require("./config/database");
const { createSocketConnections } = require("./utils/socket");
const authRouter = require("./routes/auth");
const feedRouter = require("./routes/feed");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const chatRouter = require('./routes/chat');

const app = express();

const { PORT = 7000 } = process.env;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/", authRouter);
app.use("/", feedRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", chatRouter);

const server = createServer(app);

createSocketConnections(server);

connectDB()
  .then((res) => {
    server.listen(PORT, () => {
      console.log("code is listening at", PORT);
    });
  })
  .catch((err) => {
    console.error("error while connecting db", err);
  });
