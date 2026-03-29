import Conversation from "../models/conversation.model.js";
import Friend from "../models/friend.model.js";

const pair = (a, b) => (a < b ? [a, b] : [b, a]); // sắp xếp thứ tự của user a và user b 1 cách nhất quán trc khi truy vấn

// hàm check xem 2 user đã là bạn của nhau chưa trc khi gửi tin nhắn
export const checkFriendship = async (req, res, next) => {
  try {
    const me = req.user._id.toString();

    const recipientId = req.body?.recipientId ?? null; // kiểm tra xem vế trái có là null hay ko

    const memberIds = req.body?.memberIds ?? [];

    if (!recipientId && memberIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Cần cung cấp recipientId hoặc memberIds" });
    }

    if (recipientId) {
      const [userA, userB] = pair(me, recipientId);

      const isFriend = await Friend.findOne({ userA, userB });

      if (!isFriend) {
        return res
          .status(403)
          .json({ message: "Bạn chưa kết bạn với người này" });
      }

      return next();
    }

    // kiểm tra xem chỉ có bạn bè thì mới có thể được thêm vào nhóm chat
    const friendChecks = memberIds.map(async (memberId) => {
      const [userA, userB] = pair(me, memberId);
      const friend = await Friend.findOne({ userA, userB });
      return friend ? null : memberId;
    });

    const results = await Promise.all(friendChecks);
    const notFriends = results.filter(Boolean);

    if (notFriends.length > 0) {
      return res
        .status(403)
        .json({ message: "Bạn chỉ có thể thêm bạn bè vào nhóm", notFriends });
    }

    next();
  } catch (error) {
    console.error("Lỗi xảy ra khi checkFriendship", error);
    return res.status(500).json({ message: "Lỗi hệ thống " });
  }
};

// check 1 người có phải là thành viên của nhóm chat không 
export const checkGroupMembership = async (req, res, next) => {
  try {
    const {conversationId} = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if(!conversation){
      return res.status(404).json({message: "Khong tim thay cuoc tro chuyen"});
    }

    const isMember = conversation.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if(!isMember) {
      return res.status(403).json({message: "Ban khong o trong group nay"});
    }

    req.conversation = conversation;

    next();

  } catch (error) {
    console.error("Lỗi xảy ra khi checkGroupship", error);
    return res.status(500).json({ message: "Lỗi hệ thống " });
  }
}