import Message from "../models/message.model.js";
import Conversation from "../models/cons.model.js";
import Notification from "../models/notification.model.js";
import { io, getReceiverSocketId } from "../socket/socket.js";
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage: message } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text: message
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    // Populate sender and receiver for real-time and response
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .lean();

    // Emit real-time message to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', populatedMessage);
    }

    // 👉 Create notification if sender ≠ receiver
    if (senderId.toString() !== receiverId.toString()) {
      await Notification.create({
        user: receiverId,
        sender: senderId,
        type: "message",
        message: "Sent you a message."
      });
    }

    return res.status(201).json({
      success: true,
      newMessage: populatedMessage
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getMessages = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    if (!senderId || !receiverId) {
      return res.status(400).json({ success: false, message: "Sender ID and Receiver ID are required" });
    }

    const conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } })
      .populate({
        path: "messages",
        populate: {
          path: "sender receiver",
          select: "username profilePicture"
        }
      })
      .populate("participants", "username profilePicture");

    if (!conversation) {
      return res.status(404).json({ success: false, messages: [], message: "No messages found for this conversation" });
    }

    return res.status(200).json({ success: true, messages: conversation.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error at getMessages", error: error.message });
  }
};

export const getUserConversations = async (req, res) => {
  const userId = req.id;

  const conversations = await Conversation.find({ participants: userId })
    .populate({
      path: 'participants',
      select: 'username profilePicture'
    })
    .sort({ updatedAt: -1 })
    .lean();

  const otherUsers = conversations.map(conv => {
    return conv.participants.find(p => p._id.toString() !== userId);
  });

  res.status(200).json({ success: true, recentChats: otherUsers });
};