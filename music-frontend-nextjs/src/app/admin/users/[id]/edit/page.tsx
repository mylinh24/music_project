'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/utils/apiClient';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  vip: boolean;
  contributionPoints: number;
  referralCount: number;
}

const AdminEditUser = () => {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user' as 'user' | 'admin',
    isVerified: false,
    vip: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get(`/admin/users/${params.id}`);
        setUser(response.data);
        setFormData({
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          isVerified: response.data.isVerified,
          vip: response.data.vip,
        });
      } catch (error: any) {
        console.error('Error fetching user:', error);
        setError(error.message || 'Failed to fetch user');
      }
    };
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/admin/users/${params.id}`, formData);
      setSuccess('Cập nhật người dùng thành công');
      setTimeout(() => router.push('/admin/users'), 2000);
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Cập nhật người dùng thất bại');
    }
  };

  if (error && !user) return <div className="min-h-screen bg-gray-900 text-white p-8">Lỗi: {error}</div>;
  if (!user) return <div className="min-h-screen bg-gray-900 text-white p-8">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-yellow-400">Chỉnh sửa</h1>
        </div>
        {error && <div className="mb-4 p-4 bg-red-600 text-white rounded-lg">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-600 text-white rounded-lg">{success}</div>}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">Tên</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">Họ</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">Vai trò</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                className="w-full bg-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-300">Đã xác minh</span>
              </label>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.vip}
                  onChange={(e) => setFormData({ ...formData, vip: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-300">VIP</span>
              </label>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-300 shadow-lg"
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-300 shadow-lg"
            >
              Cập nhật người dùng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditUser;
