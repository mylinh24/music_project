import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const CommentSection = ({ songId, isVip }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalComments, setTotalComments] = useState(0);
    const [showCommentForm, setShowCommentForm] = useState(false);

    const { isAuthenticated, user } = useSelector(state => state.auth);

    const fetchComments = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:6969/api/comments/song/${songId}?page=${page}&limit=10`
            );
            setComments(response.data.comments);
            setCurrentPage(response.data.pagination.current_page);
            setTotalPages(response.data.pagination.total_pages);
            setTotalComments(response.data.pagination.total_comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            alert('Không thể tải bình luận');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (songId) {
            fetchComments();
        }
    }, [songId]);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            alert('Vui lòng nhập nội dung bình luận');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:6969/api/comments',
                {
                    song_id: songId,
                    content: newComment,
                    rating: rating,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert(`Bình luận thành công!`);
            setNewComment('');
            setRating(5);
            setShowCommentForm(false);
            fetchComments(1); // Refresh comments
        } catch (error) {
            console.error('Error submitting comment:', error);
            if (error.response?.status === 403) {
                alert('Bạn không có quyền bình luận bài hát này. Vui lòng nâng cấp tài khoản VIP.');
            } else {
                alert('Không thể gửi bình luận. Vui lòng thử lại.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (rating, interactive = false) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
                            } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
                        onClick={interactive ? () => setRating(star) : undefined}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                    Bình luận ({totalComments})
                </h3>
                {isAuthenticated && (
                    <button
                        onClick={() => setShowCommentForm(!showCommentForm)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        {showCommentForm ? 'Hủy' : 'Viết bình luận'}
                    </button>
                )}
            </div>

            {/* Comment Form */}
            {showCommentForm && isAuthenticated && (
                <form onSubmit={handleSubmitComment} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đánh giá:
                        </label>
                        {renderStars(rating, true)}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội dung bình luận:
                        </label>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                            rows="4"
                            placeholder="Chia sẻ cảm nghĩ của bạn về bài hát..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                    </button>
                </form>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang tải bình luận...</p>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="border-b border-gray-200 pb-4">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    {comment.user.avatar ? (
                                        <img
                                            src={`data:image/jpeg;base64,${comment.user.avatar}`}
                                            alt={comment.user.firstName}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-gray-600 font-medium">
                                                {comment.user.firstName?.[0]}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-medium text-gray-900">
                                            {comment.user.firstName} {comment.user.lastName}
                                        </h4>
                                        <span className="text-sm text-gray-500">
                                            {formatDate(comment.created_at)}
                                        </span>
                                    </div>
                                    <div className="mt-1">
                                        {renderStars(comment.rating)}
                                    </div>
                                    <p className="mt-2 text-gray-700">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    <button
                        onClick={() => {
                            if (currentPage > 1) {
                                fetchComments(currentPage - 1);
                            }
                        }}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Trước
                    </button>
                    <span className="px-3 py-1 text-gray-700">
                        Trang {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => {
                            if (currentPage < totalPages) {
                                fetchComments(currentPage + 1);
                            }
                        }}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommentSection;
