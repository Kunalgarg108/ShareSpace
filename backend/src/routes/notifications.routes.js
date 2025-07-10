import {getNotifications ,getUnreadNotificationCount, markAllNotificationsAsRead} from '../controllers/notification.controller.js';
import express from 'express';
import isAuthenticated from '../middlewares/isAuth.js';
const router = express.Router();

router.get('/', isAuthenticated, getNotifications);
router.get('/unread/count', isAuthenticated, getUnreadNotificationCount);
router.put('/markasread', isAuthenticated, markAllNotificationsAsRead);

export default router;