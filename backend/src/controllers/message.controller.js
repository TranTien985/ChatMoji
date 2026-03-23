import Conversation from '../models/conversation.model.js'
import Message from '../models/message.model.js'
import {updateConverstationAfterCreateMessage} from '../utils/messageHelper.js'

export const sendDirectMessage = async (req, res) => {
  try {
    const {recipientId, content, conversationId} = req.body;
    const senderId = req.user._id

    let conversation;

    if(!content){
      return res.status(400).json({message: "Thiếu nội dung"})
    }

    if(conversationId){
      conversation = await Conversation.findById(conversationId)
    }

    // nếu chưa có cuộc hội thoại chat giữa 2 người thì sẽ tạo mới 
    if(!conversation){
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          {userId: senderId, joinedAt: new Date()},
          {userId: recipientId, joinedAt: new Date()}
        ],
        lastMessageAt: new Date(), // đánh dấu thời gian hoạt động mới nhất 
        unreadCount: new Map(), // dùng để đếm số tin nhắn chưa đọc
      })
    }

    // nếu có cuộc hội thoại rồi thì tạo tin nhắn mới 
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content
    });

    updateConverstationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    return res.status(201).json({message});

  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn trực tiếp", error);
    return res.status(500).json({message: "Lỗi hệ thống"});
  }
}

export const sendGroupMessage = async (req, res) => {}