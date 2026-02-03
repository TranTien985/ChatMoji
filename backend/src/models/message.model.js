import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // lưu id cuộc trò chuyện
    converstationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "converstation",
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

messageSchema.index({ converstationId: 1, createdAt: -1 }); // sắp xếp theo conver thứ tự tăng dần còn createdAt theo thứ tự giảm dần

const Message = mongoose.model("message", messageSchema);

export default Message;
