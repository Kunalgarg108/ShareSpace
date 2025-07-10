import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isRead: {
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;
