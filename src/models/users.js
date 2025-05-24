const mongoose = require("mongoose");
const validator = require("validator");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
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
      // match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
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
  },
  { timestamps: true }
);

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
