import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/:userId').get(protect, getMessages);
router.route('/').post(protect, sendMessage);

export default router;
