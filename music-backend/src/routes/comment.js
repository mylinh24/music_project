import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    createComment,
    getCommentsBySong,
    updateComment,
    deleteComment,
    getUserContributionPoints,
} from '../controllers/commentController.js';

const router = express.Router();

// Create a new comment/rating
router.post('/', authenticateToken, createComment);

// Get all comments for a song
router.get('/song/:song_id', getCommentsBySong);

// Update a comment
router.put('/:id', authenticateToken, updateComment);

// Delete a comment
router.delete('/:id', authenticateToken, deleteComment);

// Get user's contribution points
router.get('/contributions/points', authenticateToken, getUserContributionPoints);

export default router;
