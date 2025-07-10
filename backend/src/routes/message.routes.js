import express from "express";
import {
  sendMessage,
  getMessages,
  getUserConversations,
} from "../controllers/message.controller.js";
import isAuthenticated from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/send/:id",isAuthenticated, sendMessage);
router.get("/all/:id", isAuthenticated, getMessages);
router.get("/conversations", isAuthenticated, getUserConversations);


export default router;
