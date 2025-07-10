import express from 'express';
import {register,login, getProfile, editProfile, getSuggestedUsers,logout,followOrUnfollowUser,getAllUsers, getFollowers, getFollowing , getBookmarkedPosts} from '../controllers/user.controller.js';
import  isAuthenticated  from '../middlewares/isAuth.js';
import  upload  from '../middlewares/multer.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.put('/profile/edit', isAuthenticated, upload.single('profilePicture'), editProfile);
router.get('/suggested', isAuthenticated, getSuggestedUsers);
router.get('/:id/profile', isAuthenticated, getProfile);
router.put('/followorunfollow/:id', isAuthenticated, followOrUnfollowUser);
router.get('/getallusers', isAuthenticated, getAllUsers);
router.get('/followers/:id', isAuthenticated, getFollowers);
router.get('/following/:id', isAuthenticated, getFollowing);
router.get('/bookmarks/:id', isAuthenticated, getBookmarkedPosts);

export default router;
