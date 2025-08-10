import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getDataUri from '../utils/datauri.js';
import cloudinary from '../config/cloudinary.config.js';
import Post from '../models/post.model.js';
import { createNotification } from './notification.controller.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).json({ success: false, message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
      return res.status(500).json({ success: false, message: "Error hashing password" });
    }
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ success: false, message: "All fields are required" });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Password" });
    }

    const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    if (!token) {
      return res.status(500).json({ success: false, message: "Error generating token" });
    }
    const populatedPosts = await Promise.all(user.posts.map(async (postId) => {
      const post = await Post.findById(postId);
      if (post.author.toString() !== user._id.toString()) {
        return null;
      }
      return post;
    }));
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts.filter(post => post !== null),
      bookmarks: user.bookmarks,
      likedPosts: user.likedPosts,
    }
    return res.cookie('token', token, { httpOnly: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 , secure : true}).status(200).json({ success: true, message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', { httpOnly: true, sameSite: 'None', maxAge: 0 , secure : true });
    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error at getProfile", error: error.message });
  }
}

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    let cloudRes;
    if (!userId) {
      return res.status(401).json({ success: false, message: "All fields are required" });
    }
    if (req.file) {
      const fileUri = getDataUri(req.file);
      cloudRes = await cloudinary.uploader.upload(fileUri);
    }
    const updateData = { bio, gender };
    if (cloudRes) {
      updateData.profilePicture = cloudRes.secure_url;
    }
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password -__v');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error at editProfile", error: error.message });
  }
}


export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const searchConditions = [];
    if (user.username) {
      searchConditions.push({ username: { $regex: user.username, $options: "i" } });
    }
    if (user.bio) {
      searchConditions.push({ bio: { $regex: user.bio, $options: "i" } });
    }
    let suggestedUsers = [];
    if (searchConditions.length > 0) {
      suggestedUsers = await User.find({
        _id: { $ne: userId },
        $or: searchConditions,
        following: { $nin: [userId] }
      }).select('-password -__v').sort({ createdAt: -1 }).limit(7);
    } else {
      suggestedUsers = await User.find({
        _id: { $ne: userId }
      }).select('-password -__v').sort({ createdAt: -1 }).limit(7);
    }

    const remainingCount = 12 - suggestedUsers.length;
    let randomUsers = [];

    if (remainingCount > 0) {
      const matchStage = {
        _id: { $ne: userId }
      };

      if (suggestedUsers.length > 0) {
        matchStage._id = { $nin: [...suggestedUsers.map(u => u._id), userId] };
      }
      randomUsers = await User.aggregate([
        { $match: matchStage },
        { $sample: { size: remainingCount } },
        { $project: { password: 0, __v: 0 } }
      ]);
    }
    const finalUsers = [...suggestedUsers, ...randomUsers];
    return res.status(200).json({ success: true, finalUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error at getSuggestedUsers", error: error.message });
  }
}


export const followOrUnfollowUser = async (req, res) => {
  try {
    const followersId = req.id;
    const followingId = req.params.id;

    if (followersId === followingId) {
      return res.status(400).json({ success: false, message: "You cannot follow or unfollow yourself" });
    }
    const user = await User.findById(followersId).select('-password');
    const TargetUser = await User.findById(followingId);

    if (!user || !TargetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.following.includes(followingId)) {
      user.following = user.following.filter(id => id.toString() !== followingId);
      TargetUser.followers = TargetUser.followers.filter(id => id.toString() !== followersId);

      await user.save();
      await TargetUser.save();

      const updatedUser = await User.findById(followersId).select('-password');

      return res.status(200).json({ success: true, message: "Unfollowed successfully", user: updatedUser });

    } else {
      user.following.push(followingId);
      TargetUser.followers.push(followersId);

      await user.save();
      await TargetUser.save();
      await createNotification(
        followingId, 
        "follow",    
        null,        
        followersId, 
        `${user.username} started following you`  
      );

      const updatedUser = await User.findById(followersId).select('-password');

      return res.status(200).json({
        success: true,
        message: "Followed successfully",
        user: updatedUser,
        targetUser: {
          _id: TargetUser._id,
          following: TargetUser.following,
          followers: TargetUser.followers
        }
      });
    }

  } catch (error) {
    console.error("Server error at followOrUnfollowUser:", error);
    return res.status(500).json({
      success: false,
      message: "Server error at followOrUnfollowUser",
      error: error.message
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -__v');
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error at getAllUsers", error: error.message });
  }
}

export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .populate("followers", "_id username name profilePicture")
      .select("followers");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, followers: user.followers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .populate("following", "_id username name profilePicture")
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, following: user.following });
  } catch (err) {
    console.error("Error fetching following list:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBookmarkedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.id).populate({
      path: "bookmarks",
      populate: { path: "author", select: "username profilePicture" },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      bookmarkedPosts: user.bookmarks,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error fetching bookmarks",
      error: err.message,
    });
  }
};



