import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }, //mongoose sẽ ko tạo id riêng cho phần tử mới thêm vào
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { _id: false },
);

const lastMessageSchema = new mongoose.Schema(
  {
    _id: { type: String },
    content: {
      type: String,
      default: null,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    createdAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"], // đoạn chat chỉ có thể chat 2 người hoặc 1 nhóm
      required: true,
    },
    participants: {
      type: [participantSchema],
      required: true,
    },
    group: {
      type: [groupSchema],
    },
    lastMessageAt: {
      // thời gian tin nhắn cuối
      type: Date,
    },
    seenBy: [
      // hiển thị những người đã xem tin nhắn
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    lastMessage: {
      // hiển thị tin nhắn cuối của cuộc hội thoại
      type: lastMessageSchema,
      default: null,
    },
    unreadCount: {
      // hiển thị số tin nhắn chưa đọc
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true },
);

// giúp tăng tốc độ truy vấn
conversationSchema.index({
  "participants.userId": 1,
  lastMessageAt: -1,
});

const Conversation = mongoose.model("conversation", conversationSchema);

export default Conversation;
