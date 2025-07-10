import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // user to whom notification is sent
  type: { type: String, enum: ["like", "comment", "mention", "follow", "message"], required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who triggered the notification
  message: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;