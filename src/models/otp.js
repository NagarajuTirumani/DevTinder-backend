require("dotenv").config();

const mongoose = require("mongoose");
const validator = require("validator");
const nodemailer = require("nodemailer");

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
  const { EMAIL_USER, EMAIL_PASSWORD } = process.env;
  const { firstName, lastName, otp, email } = this;
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Dev Tinder." <${EMAIL_USER}>`,
      to: email,
      subject: "OTP for DevTinder Registration",
      html: `
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
