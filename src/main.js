require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

require('./utils/remainder');

const { connectDB } = require("./config/database");
const authRouter = require('./routes/auth');
const feedRouter = require('./routes/feed');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');

const app = express();

const { PORT = 7000 } = process.env;

app.use(express.json());
app.use(cookieParser());

app.use('/', authRouter);
app.use('/', feedRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);

connectDB()
  .then((res) => {
    app.listen(PORT, () => {
      console.log("code is listening at", PORT);
    });
  })
  .catch((err) => {
    console.error("error while connecting db", err);
  });
