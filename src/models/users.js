require("dotenv").config();
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const { JWT_SECRET_AUTH_KEY } = process.env;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Please enter stong password");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      default: "Male",
      validate(value) {
        if (!["Male", "Female", "Other"].includes(value)) {
          throw new Error("gender value is not valid");
        }
      },
    },
    skills: {
      type: [String],
    },
    about: {
      type: String,
      default: "Hi, I am a Software developer",
    },
    imgUrl: {
      type: String,
      default: "https://cdn.vectorstock.com/i/1000v/54/69/male-user-icon-vector-8865469.jpg",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("URL is invalid")
        }
      },
    }
  },
  { timestamps: true }
);

userSchema.methods.createJWT = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, JWT_SECRET_AUTH_KEY, {
    expiresIn: 24 * 60 * 60,
  }); //expires mention in sec
  return token;
};

userSchema.methods.isValidPassword = async function (passwordByUser) {
  const user = this;
  const hashPassword = user.password;
  const isPasswordMatched = await bcrypt.compare(passwordByUser, hashPassword);
  return isPasswordMatched;
};

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
