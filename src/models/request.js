const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const requestSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Types.ObjectId,
      require: true,
    },
    toUserId: {
      type: mongoose.Types.ObjectId,
      require: true,
    },
    status: {
      type: String,
      require: true,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: `{VALUE} is invalid status`,
      },
    },
  },
  {
    timestamps: true,
  }
);

requestSchema.index({ fromUserId: 1, toUserId: 1 });

requestSchema.pre("save", function (next) {
  const request = this;
  if (request.toUserId.equals(request.fromUserId)) {
    throw new Error("you cannot send request to yourself!");
  }
  next();
});

const RequestModel = model("requests", requestSchema);

module.exports = RequestModel;
