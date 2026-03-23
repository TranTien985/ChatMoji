import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // lưu id cuộc trò chuyện
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    imgUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ conversationId: 1, createdAt: -1 }); // sắp xếp theo conver thứ tự tăng dần còn createdAt theo thứ tự giảm dần

const Message = mongoose.model("message", messageSchema);

export default Message;
