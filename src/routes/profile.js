const express = require("express");

const { authUser } = require("../middleware/auth");

const profileRouter = express.Router();

profileRouter.get("/profile", authUser, async (req, res) => {
  try {
    const { user } = req.body;
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = profileRouter;
