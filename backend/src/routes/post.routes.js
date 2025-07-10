import express from "express";
import {
  addNewPost,
  getAllPosts,
  likePost,
  deletePost,
  getPostById,
  addCommentToPost,
  bookmarkPost,
  getAllCommentsOfPost,
  getPostsByUserId
} from "../controllers/post.controller.js";
import isAuthenticated from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/addpost", isAuthenticated,upload.single("image"),addNewPost);

router.get("/all", isAuthenticated,getAllPosts);
router.get("/userpost/all", isAuthenticated, getPostById);
router.get("/user/:userId/posts", getPostsByUserId);
router.post("/:id/like", isAuthenticated,likePost);
router.post("/:id/comment",isAuthenticated, addCommentToPost);
router.get("/:id/comment/all", isAuthenticated,getAllCommentsOfPost);
router.delete("/delete/:id", isAuthenticated, deletePost);
router.put("/:id/bookmark", isAuthenticated, bookmarkPost);

export default router;
