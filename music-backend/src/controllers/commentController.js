import Comment from '../models/comment.js';
import User from '../models/user.js';
import Song from '../models/song.js';
import { sendAdminNotification } from '../services/emailService.js';
import { broadcastToAdmins } from '../websocket.js';

export const createComment = async (req, res) => {
    try {
        const { song_id, content, rating } = req.body;
        const user_id = req.userId;

        if (!song_id || !content || !rating) {
            return res.status(400).json({
                error: 'Song ID, content và rating là bắt buộc.'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                error: 'Rating phải từ 1 đến 5.'
            });
        }

        // Check if user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User không tồn tại.' });
        }

        // Check if song exists
        const song = await Song.findByPk(song_id);
        if (!song) {
            return res.status(404).json({ error: 'Bài hát không tồn tại.' });
        }

        // Check VIP permission for exclusive songs
        if (song.exclusive && !user.vip) {
            return res.status(403).json({
                error: 'Bạn không có quyền bình luận bài hát này. Vui lòng nâng cấp tài khoản VIP.'
            });
        }

        // Create comment
        const comment = await Comment.create({
            user_id,
            song_id,
            content,
            rating,
        });

        // Send notifications to admin
        const message = `New comment: User ${user.firstName} ${user.lastName} (${user.email}) commented on song ID ${song_id}.`;
        broadcastToAdmins({ type: 'new_comment', message });
        try {
            await sendAdminNotification('New Comment', message);
        } catch (emailError) {
            console.error('Failed to send admin email notification:', emailError);
        }

        // Loại bỏ logic tích điểm từ comment

        // Get the created comment with user info
        const commentWithUser = await Comment.findByPk(comment.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'avatar'],
                }
            ],
        });

        // Convert avatar BLOB to base64 if exists
        if (commentWithUser.user.avatar) {
            commentWithUser.user.avatar = commentWithUser.user.avatar.toString('base64');
        }

        res.status(201).json({
            message: 'Bình luận thành công!',
            comment: commentWithUser,
        });

    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
};

export const getCommentsBySong = async (req, res) => {
    try {
        const { song_id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!song_id) {
            return res.status(400).json({ error: 'Song ID là bắt buộc.' });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: comments } = await Comment.findAndCountAll({
            where: { song_id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'avatar'],
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset,
        });

        // Convert avatar BLOB to base64 for all comments
        comments.forEach(comment => {
            if (comment.user && comment.user.avatar) {
                comment.user.avatar = comment.user.avatar.toString('base64');
            }
        });

        res.json({
            comments,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(count / parseInt(limit)),
                total_comments: count,
            },
        });

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
};

export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, rating } = req.body;
        const user_id = req.userId;

        const comment = await Comment.findByPk(id);

        if (!comment) {
            return res.status(404).json({ error: 'Bình luận không tồn tại.' });
        }

        if (comment.user_id !== user_id) {
            return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa bình luận này.' });
        }

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ error: 'Rating phải từ 1 đến 5.' });
        }

        await comment.update({
            content: content || comment.content,
            rating: rating !== undefined ? rating : comment.rating,
        });

        res.json({
            message: 'Cập nhật bình luận thành công!',
            comment,
        });

    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.userId;

        const comment = await Comment.findByPk(id);

        if (!comment) {
            return res.status(404).json({ error: 'Bình luận không tồn tại.' });
        }

        if (comment.user_id !== user_id) {
            return res.status(403).json({ error: 'Bạn không có quyền xóa bình luận này.' });
        }

        await comment.destroy();

        res.json({ message: 'Xóa bình luận thành công!' });

    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Lỗi server nội bộ' });
    }
};


