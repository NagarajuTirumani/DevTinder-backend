const { Schema, model, SchemaType } = require("mongoose");

const messageSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    message: {
      type: Schema.Types.String,
      require: true,
    },
  },
  { timestamps: true }
);

const chatSchema = new Schema({
  participants: [
    {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "user",
    },
  ],
  messages: [messageSchema],
});

const Chat = model("Chat", chatSchema);

module.exports = { Chat };
