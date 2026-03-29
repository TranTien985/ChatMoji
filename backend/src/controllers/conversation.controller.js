import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

// tạo cuộc trò chuyện
export const createConversation = async (req, res) => {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user._id;

    if (
      !type ||
      (type === "group" && !name) ||
      !memberIds ||
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Tên nhóm và danh sách thành viên là bắt buộc " });
    }

    let conversation;

    // nếu đây là đoạn chat giữa 2 người
    if (type === "direct") {
      const participantId = memberIds[0];

      conversation = await Conversation.findOne({
        type: "direct",
        "participants.userId": { $all: [userId, participantId] }, // phải chửa đầy đủ các giá trị trong mảng
      });
    }

    // nếu giá trị rỗng thì sẽ tạo 1 conversation mới
    if (!conversation) {
      conversation = new Conversation({
        type: "direct",
        participants: [{ userId }, { userId: participantId }],
        lastMessageAt: new Date(),
      });
    }

    await conversation.save();

    // nếu đây là cuộc trò chuyện nhóm
    if (type === "group") {
      conversation = new Conversation({
        type: "group",
        participants: [{ userId }, ...memberIds.map((id) => ({ userId: id }))], // danh sách tất cả các thành viên trong nhóm
        group: {
          name,
          createdBy: userId,
        },
        lastMessageAt: new Date(),
      });

      await conversation.save();
    }

    if (!conversation) {
      return res
        .status(400)
        .json({ message: "Conversation type không hợp lệ" });
    }

    await conversation.populate([
      { path: "participants.userId", select: "displayname avatarUrl" },
      {
        path: "seenBy",
        select: "displayName avatarUrl",
      },
      { path: "lastMessage.senderId", select: "displayName avatarUrl" },
    ]);

    return res.status(201).json({ conversation });
  } catch (error) {
    console.error("Lỗi khi tạo conversation", error);
    return res.status(500).json({ message: "Lỗi hệ thống " });
  }
};

// lấy danh sách các cuộc trò chuyện của user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.find({
      "participants.userId": userId,
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate({
        path: "participants.userId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "lastMessage.senderId",
        select: "displayName avatarUrl",
      })
      .populate({
        path: "seenBy",
        select: "displayName avatarUrl",
      });

    // duyệt qua từng cuộc trò chuyện và format lại thông tin vào mảng cho fe dễ dùng hơn
    const formatted = conversations.map((convo) => {
      const participants = (convo.participants || []).map((p) => ({
        _id: p.userId?._id,
        displayName: p.userId?.displayName,
        avatarUrl: p.userId?.avatarUrl,
        joinedAt: p.joinedAt,
      }));

      return {
        ...convo.toObject(), // chuyển mongoose document thành js thuần để tránh lấy cả dữ liệu thừa
        unreadCount: convo.unreadCount || {},
        participants,
      };
    });

    return res.status(200).json({ conversations: formatted });
  } catch (error) {
    console.error("loi xay ra khi lay conversations", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, cursor } = req.query;

    const query = { conversationId };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    let messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1);

    let nextCursor = null;

    // nếu số lượng tin nhắn quá limit
    if (messages.length > Number(limit)) {
      const nextMessage = messages[messages.length - 1]; // thì ta sẽ lấy mốc là tin nhắn cuối
      nextCursor = nextMessage.createdAt.toISOString(); // set nextCuror từ tin nhắn cuối của cursor trước
      messages.pop();
    }

    messages = messages.reverse(); // đảo ngược tin mới nhất sẽ hiển thị ở cuối

    return res.status(200).json({
      messages,
      nextCursor,
    });
  } catch (error) {
    console.error("Loi xay ra khi lay messages", error);
    return res.status(500).json({ message: "Loi he thong" });
  }
};
