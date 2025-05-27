const express = require("express");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../utils/validation");
const UserModel = require("../models/users");

const authRouter = express.Router();

const saltRounds = 10;

authRouter.post("/signup", async (req, res) => {
  try {
    // validate password
    validateSignUpData(req.body);

    const { password } = req.body;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const user = new UserModel({ ...req.body, password: hashPassword });
    const resp = await user.save();
    if (resp) {
      res.send("User Created Successfully!");
    } else {
      res.status(500).send("Failed To Create User!!!!");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!validator.isEmail(email)) {
      throw new Error("Invalid Email");
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordMatched = await user.isValidPassword(password);
    if (isPasswordMatched) {
      const token = user.createJWT();
      res.cookie("access_token", token, {
        expires: new Date(Date.now() + 24 * 3600000),
      });
      res.send("User Login Successful");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

authRouter.delete("/user", async (req, res) => {
  const id = req.body._id;
  try {
    if (!id) {
      res.status(404).send("User Not Found To Delete");
      return;
    }
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (deletedUser) {
      res.send("User deleted successfully...");
    } else {
      res.status(404).send("User Not Found To Delete");
    }
  } catch (error) {
    res.status(404).send("User Not Found To Delete");
  }
});

authRouter.patch("/user", async (req, res) => {
  const { _id, ...restData } = req.body;
  const allowedFeilds = [
    "firstName",
    "lastName",
    "password",
    "age",
    "skills",
    "about",
  ];
  const isAllowedDataToUpdate = Object.keys(restData).every((key) =>
    allowedFeilds.includes(key)
  );
  try {
    if (!isAllowedDataToUpdate) {
      throw new Error(
        "Some of these feilds are not allowed to update. Please check again"
      );
    } else if (restData?.skills?.length > 10) {
      throw new Error("Max length for skill set is 10.");
    }
    const user = await UserModel.findByIdAndUpdate(_id, restData, {
      runValidators: true,
      returnOriginal: false,
    });
    res.send(user);
  } catch (error) {
    res.status(500).send("Fail to Update: " + error.message);
  }
});

module.exports = authRouter;
