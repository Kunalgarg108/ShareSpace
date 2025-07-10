import Notification from "../models/notification.model.js";
import sharp from "sharp";
import cloudinary from "../config/cloudinary.config.js";
import dotenv from "dotenv";
import Post from "../models/post.model.js"
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import { createNotification } from "./notification.controller.js";
dotenv.config();


export const addNewPost = async (req, res) => {
    try {
        const authorId = req.id;
        const { caption } = req.body;
        const image = req.file;

        if (!authorId) {
            return res.status(400).json({ success: false, message: "Author ID and caption are required" });
        }
        if (!image) {
            return res.status(400).json({ success: false, message: "Image is required" });
        }
        const optimiseimagebuffer = await (sharp(image.buffer).resize(800, 800, {
            fit: "inside",
        }).toFormat("jpeg", {
            quality: 80,
        })).toBuffer();
        let cloudRes;
        if (optimiseimagebuffer) {
            const fileUri = `data:image/jpeg;base64,${optimiseimagebuffer.toString('base64')}`;
            cloudRes = await cloudinary.uploader.upload(fileUri);
        }

        const newPost = new Post({
            author: authorId,
            caption: caption || "",
            image: cloudRes ? cloudRes.secure_url : null,
        });
        await newPost.save();
        const user = await User.findById(authorId, "-password -__v");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.posts.push(newPost._id);
        await user.save();
        await newPost.populate("author", "-password -__v");
        return res.status(201).json({ success: true, message: "Post created successfully", post: newPost });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error at addNewPost", error: error.message });
    }
}
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "author",
                select: "username profilePicture bio",
            })
            .populate({
                path: "comments",
                populate: {
                    path: "author",
                    select: "username profilePicture",
                },
                options: { sort: { createdAt: -1 } } // <-- correct way to sort nested populate
            })
            .populate({
                path: "likes",
                select: "username profilePicture",
            });

        return res.status(200).json({ success: true, posts });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error at getAllPosts",
            error: error.message,
        });
    }
};
export const getPostsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .populate({ path: "author", select: "username profilePicture bio" })
            .populate({
                path: "comments",
                select: "text createdAt",
                options: { sort: { createdAt: -1 } },
                populate: { path: "author", select: "username profilePicture" }
            });

        return res.status(200).json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


export const getPostById = async (req, res) => {
    try {
        const authorId = req.id;
        if (!authorId) {
            return res.status(400).json({ success: false, message: "Author ID is required" });
        }
        const post = await Post.find({ author: authorId })
            .sort({ createdAt: -1 })
            .populate({ path: "author", select: "username profilePicture bio" })
            .populate({ path: "comments", select: "text createdAt", sort: { createdAt: -1 }, populate: { path: "author", select: "username profilePicture" } });
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        return res.status(200).json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error at getPostById", error: error.message });
    }
}
export const likePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        if (!postId || !userId) {
            return res.status(400).json({ success: false, message: "Post ID and User ID are required" });
        }


        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });
        const user = await User.findById(userId).select("username profilePicture likedPosts");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isLiked = post.likes.includes(userId);
        if (isLiked) {
            post.likes.pull(userId);
            user.likedPosts.pull(postId);
        } else {
            post.likes.push(userId);
            user.likedPosts.push(postId);

            // 👉 Create notification if liker ≠ post author
            if (post.author.toString() !== userId) {
                await createNotification(
                    post.author,
                    "like",
                    post._id,
                    userId,
                    "liked your post."
                );
            }
        }
        await post.save();
        await user.save();

        return res.status(200).json({
            success: true,
            message: isLiked ? "Post unliked" : "Post liked",
            likes: post.likes,
            likedPosts: user.likedPosts,
            isLiked: !isLiked
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error at likePost", error: error.message });
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;

        if (!postId || !userId) {
            return res.status(400).json({ success: false, message: "Post ID and User ID are required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        if (post.author.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this post" });
        }

        await post.deleteOne();  // ✅ instead of post.remove()
        await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });
        await Comment.deleteMany({ post: postId });

        return res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error at deletePost", error: error.message });
    }
};

export const addCommentToPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;
        const { text } = req.body;

        if (!postId || !userId || !text) {
            return res.status(400).json({ success: false, message: "Post ID, User ID, and comment text are required" });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });

        const comment = new Comment({
            author: userId,
            text,
            post: postId
        });
        await comment.save();
        await comment.populate({ path: "author", select: "username profilePicture" });

        post.comments.push(comment._id);
        await post.save();

        // 👉 Create notification if commenter ≠ post author
        if (post.author.toString() !== userId) {
            await createNotification(
                post.author,
                "comment",
                post._id,
                userId,
                "commented on your post."
            );
        }

        return res.status(201).json({ success: true, message: "Comment added successfully", comment });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error at addCommentToPost", error: error.message });
    }
}



export const getAllCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id;

        if (!postId) {
            return res.status(400).json({ success: false, message: "Post ID is required" });
        }

        // Directly query comments belonging to this post
        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: -1 })
            .populate("author", "username profilePicture"); // populate author's username & picture
        if (!comments || comments.length === 0) {
            return res.status(404).json({ success: false, message: "No comments found for this post" });
        }
        return res.status(200).json({ success: true, comments });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error at getAllCommentsOfPost", error: error.message });
    }
}

export const bookmarkPost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        if (!userId || !postId) {
            return res.status(400).json({ success: false, message: "User ID and Post ID are required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isBookmarked = user.bookmarks.includes(post._id);
        if (isBookmarked) {
            user.bookmarks.pull(post._id);
        } else {
            user.bookmarks.push(post._id);
        }
        await user.save();

        return res.status(200).json({
            success: true,
            message: isBookmarked ? "Post removed from bookmarks" : "Post bookmarked",
            bookmarks: user.bookmarks,   // ✅ include updated bookmarks array
            isBookmarked: !isBookmarked  // ✅ helpful for immediate UI toggle
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error at bookmarksPost", error: error.message });
    }
}

export const getBookmarkedPosts = async (req, res) => {
    try {
        const userId = req.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const user = await User.findById(userId).populate({
            path: "bookmarks",
            select: "title content createdAt",
            populate: {
                path: "author",
                select: "username profilePicture"
            }
        });

        if (!user || !user.bookmarks || user.bookmarks.length === 0) {
            return res.status(404).json({ success: false, message: "No bookmarked posts found" });
        }

        return res.status(200).json({ success: true, bookmarks: user.bookmarks });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error at getBookmarkedPosts", error: error.message });
    }
}
