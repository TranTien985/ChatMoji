import Friend from "../models/friend.model.js";
import User from "../models/user.model.js";
import friendRequest from "../models/friendRequest.model.js";

// [POST] /auth/friends/requests
export const sendFriendRequest = async (req, res) => {
  try {
    const { to, message } = req.body;

    const from = req.user._id;

    // trường hợp người dùng tự gửi cho chính mình
    if (from === to) {
      return res
        .status(400)
        .json({ message: "không thể gửi lời mời cho chính mình" });
    }

    const userExists = await User.findOne({ _id: to });

    if (!userExists) {
      return res.status(404).json({ message: "người dùng không tồn tại" });
    }

    let userA = from.toString();
    let userB = to.toString();

    // userA luôn là id nhỏ hơn userB
    if (userA > userB) {
      [userA, userB] = [userB, userA];
    }

    const [alreadyFriend, existingRequest] = await Promise.all([
      // cho phép chạy cả 2 câu truy vấn cùng lúc với Promise
      Friend.findOne({ userA, userB }), // kiểm tra xem cả 2 đã là bạn chưa
      friendRequest.findOne({
        // kiểm tra lời mời từ 2 phía
        $or: [
          { from, to },
          { from: to, to: from },
        ],
      }),
    ]);

    if (alreadyFriend) {
      return res.status(400).json({ message: "hai người đã là bạn bè" });
    }

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "đã có lời mời kết bạn đang chờ" });
    }

    const request = await friendRequest.create({
      from,
      to,
      message,
    });

    return res
      .status(200)
      .json({ message: "gửi lời mời kết bạn thành công", request });
  } catch (error) {
    console.error("lỗi khi yêu cầu kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// [POST] /auth/friends/requests/:requestId/accept
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await friendRequest.findById(requestId);

    if (!request) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy lời mời kết bạn" });
    }

    //chỉ có người nhận mới accept được lời mời
    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chấp nhận lời mời này" });
    }

    // tạo quan hệ bạn bè mới
    const friend = await Friend.create({
      userA: request.from,
      userB: request.to,
    });

    await friendRequest.findByIdAndDelete(requestId); // xóa lời mời

    const from = await User.findById(request.from)
      .select("_id displayName avatarUrl")
      .lean(); // hàm lean để tối ưu query. Khi có lean thì dữ liệu trả về sẽ là js object

    return res.status(200).json({
      message: "Chấp nhận lời mời kết bạn thành công",
      newFriend: {
        _id: from?._id,
        displayName: from?.displayName,
        avatarUrl: from?.avatarUrl,
      },
    });
  } catch (error) {
    console.error("lỗi khi chấp nhận lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// [POST] /auth/friends/requests/:requestId/decline
export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await friendRequest.findById(requestId);

    if (!request) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lời mời kết bạn" });
    }

    if (request.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa lời mời kết bạn này " });
    }

    await friendRequest.findByIdAndDelete(requestId);

    return res.status(204).end();
  } catch (error) {
    console.error("lỗi khi từ chối lời mời kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// [GET] /auth/friends/
export const getAllFriend = async (req, res) => {
  try {
    const userId = req.user._id;

    // lấy ra bạn bè từ 2 phía gửi và nhận tránh sót bạn bè
    const friendShips = await Friend.find({
      $or: [{ userA: userId }, { userB: userId }],
    })
      .populate("userA", "_id displayName avatarUrl")
      .populate("userB", "_id displayName avatarUrl")
      .lean();

    if (!friendShips.length) {
      return res.status(200).json({ friends: [] });
    }

    const friends = friendShips.map((f) =>
      f.userA._id.toString() === userId.toString() ? f.userB : f.userA
    );

    return res.status(200).json({friends})

  } catch (error) {
    console.error("lỗi khi lấy danh sách bạn bè", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// [GET] /auth/friends/requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const populateFields = '_id username displayName avatarUrl';

    // xử lí bất đồng bộ song song 
    const [sent, received] = await Promise.all([
      friendRequest.find({from: userId}).populate("to", populateFields), // danh sách lời mời tôi gửi đi
      friendRequest.find({to: userId}).populate("from", populateFields) // danh sách lời mời tôi nhận được 
    ])

    return res.status(200).json({sent, received});

  } catch (error) {
    console.error("lỗi khi lấy danh sách yêu cầu kết bạn", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
