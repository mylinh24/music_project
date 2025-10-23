'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Comment {
    id: number;
    content: string;
    rating: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
    song: {
        id: number;
        title: string;
    };
}

interface Pagination {
    current_page: number;
    total_pages: number;
    total_comments: number;
}

export default function AdminComments() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const fetchComments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(searchTerm && { search: searchTerm })
            });

            const response = await axios.get(`http://localhost:3001/admin/comments?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setComments(response.data.comments);
            setTotalPages(response.data.pagination.total_pages);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError('Không thể tải danh sách bình luận');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [page, statusFilter]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (page === 1) {
                fetchComments();
            } else {
                setPage(1);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleStatusChange = async (commentId: number, newStatus: 'pending' | 'approved' | 'rejected') => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3001/admin/comments/${commentId}/status`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setComments(comments.map(comment =>
                comment.id === commentId ? { ...comment, status: newStatus } : comment
            ));
        } catch (error) {
            console.error('Error updating comment status:', error);
            setError('Không thể cập nhật trạng thái bình luận');
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3001/admin/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove from local state
            setComments(comments.filter(comment => comment.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
            setError('Không thể xóa bình luận');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            approved: { color: 'bg-green-500', text: 'Đã duyệt' },
            pending: { color: 'bg-yellow-500', text: 'Chờ duyệt' },
            rejected: { color: 'bg-red-500', text: 'Từ chối' }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} text-white`}>
                {config.text}
            </span>
        );
    };

    if (loading && comments.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
                <div className="text-xl">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8 pt-20 pb-24">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Quản lý bình luận</h1>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Tìm theo nội dung hoặc tên người dùng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-96 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1200px]">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 w-16">ID</th>
                                    <th className="px-4 py-3 w-48">Người dùng</th>
                                    <th className="px-4 py-3 w-64">Bài hát</th>
                                    <th className="px-4 py-3 w-80">Nội dung</th>
                                    <th className="px-4 py-3 w-24">Đánh giá</th>
                                    <th className="px-4 py-3 w-32">Trạng thái</th>
                                    <th className="px-4 py-3 w-32">Ngày tạo</th>
                                    <th className="px-4 py-3 w-48">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comments.map((comment) => (
                                    <tr key={comment.id} className="border-t border-gray-600 hover:bg-gray-700">
                                        <td className="px-4 py-3">{comment.id}</td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-medium">{comment.user.firstName} {comment.user.lastName}</div>
                                                <div className="text-sm text-gray-400">{comment.user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="max-w-xs truncate" title={comment.song.title}>
                                                {comment.song.title}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="max-w-xs truncate" title={comment.content}>
                                                {comment.content}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        className={`text-lg ${star <= comment.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(comment.status)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                {comment.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(comment.id, 'approved')}
                                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                                                        >
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(comment.id, 'rejected')}
                                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                                {comment.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleStatusChange(comment.id, 'rejected')}
                                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                                    >
                                                        Từ chối
                                                    </button>
                                                )}
                                                {comment.status === 'rejected' && (
                                                    <button
                                                        onClick={() => handleStatusChange(comment.id, 'approved')}
                                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                                                    >
                                                        Duyệt lại
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {comments.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-400">
                        Không có bình luận nào
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded"
                            >
                                Trước
                            </button>
                            <span className="px-4 py-2 bg-gray-700 rounded">
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
