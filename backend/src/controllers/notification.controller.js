import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.id })
      .populate("sender", "username profilePicture")
      .populate("post", "image")
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching notifications", error: err.message });
  }
};

export const createNotification = async (userId, type, postId, senderId, message) => {
  try {
    // Don't create notification if user is notifying themselves
    if (userId.toString() === senderId.toString()) {
      return;
    }

    const notification = new Notification({
      user: userId,
      type,
      post: postId,
      sender: senderId,
      message,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

export const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.id, isRead: false });
    res.status(200).json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching unread count", error: err.message });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error marking notifications", error: err.message });
  }
};