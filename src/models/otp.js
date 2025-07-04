const mongoose = require("mongoose");
const validator = require("validator");
const { sendEmail } = require("../utils/email");

const { Schema, model } = mongoose;

const otpSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 50,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 50,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email " + value);
      }
    },
  },
  otp: {
    type: String,
    required: true,
    minLength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

otpSchema.pre("save", async function (next) {
  const { firstName, lastName, otp, email } = this;
  try {
    await sendEmail({
      subject: "OTP for DevTinder Registration",
      toEmail: email,
      template: `
        <p>Hi ${firstName} ${lastName}, Welcome to DevTinder!</p>
        <p>Your Code is <span style="font-weight: bold;">${otp}</span>. It will be valid for 5 min only.</p>
        <p>If you didn't request this, simply ignore this message</p>

        <p>
            <span>yours,</span><br/>
            <span>The DevTinder Team</span>
        </p>
      `,
    });
    next();
  } catch (error) {
    throw new Error(error.message);
  }
});

const OTPModel = model("otp", otpSchema);

module.exports = OTPModel;
