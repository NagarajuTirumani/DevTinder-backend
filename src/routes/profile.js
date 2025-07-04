const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const sharp = require("sharp");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const { authUser } = require("../middleware/auth");
const {
  validateEditUserData,
  validatePasswordUpdateData,
} = require("../utils/validation");
const UserModel = require("../models/users");
const { getSignedUrlFromImgId } = require("../utils/common");

const saltRounds = 10;

const {
  AWS_BUCKET_REGION,
  AWS_BUCKET_NAME,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
} = process.env;

const client = new S3Client({
  region: AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const profileRouter = express.Router();

profileRouter.get("/profile/view", authUser, async (req, res) => {
  try {
    const { user } = req;
    let updatedUser;
    if (!user.imgId) {
      updatedUser = user;
    } else {
      const imgUrl = await getSignedUrlFromImgId(user);
      updatedUser = { ...user.toObject(), imgUrl };
    }
    res.json({ message: "Fetched Profile Successfully!", data: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

profileRouter.patch(
  "/profile/edit",
  authUser,
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      const file = req.file;
      validateEditUserData(req);
      if (file) {
        const buffer = await sharp(file.buffer)
          .resize({
            height: 1080,
            width: 1080,
            fit: "contain",
          })
          .toBuffer();

        const params = {
          Bucket: AWS_BUCKET_NAME,
          Key: `${req.body.imgId}`,
          Body: buffer,
          fileType: file.mimetype,
        };

        const command = new PutObjectCommand(params);

        await client.send(command);
      }
      const user = req.user;
      Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));

      if (user.skills) {
        user.skills = JSON.parse(user.skills);
      }
      await user.save();
      let updatedUser;
      if (user.imgId) {
        const imgUrl = await getSignedUrlFromImgId(user);
        updatedUser = { ...user.toObject(), imgUrl };
      } else {
        updatedUser = user;
      }
      res.json({
        message: "User Updated",
        data: updatedUser,
      });
    } catch (error) {
      res.status(400).json({ message: "Fail to Update: " + error.message });
    }
  }
);

profileRouter.patch("/profile/password", async (req, res) => {
  const { email, password, newPassword } = req.body;
  try {
    validatePasswordUpdateData(req);
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("Invalid User Credentials");
    }
    const isPasswordMatched = await user.isValidPassword(password);
    if (!isPasswordMatched) {
      throw new Error("Invalid User Credentials");
    }
    user.password = await bcrypt.hash(newPassword, saltRounds);
    await user.save();
    res.json({
      message: "User Updated",
      data: user,
    });
  } catch (error) {
    res.status(400).json({ message: "Fail to Update: " + error.message });
  }
});

module.exports = profileRouter;
