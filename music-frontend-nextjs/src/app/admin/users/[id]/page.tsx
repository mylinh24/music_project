'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '../../../../utils/apiClient';

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

const AdminUserDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get(`/admin/users/${params.id}`);
        setUser(response.data);
      } catch (error: any) {
        console.error('Error fetching user:', error);
        setError(error.message || 'Failed to fetch user');
      }
    };
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  if (error) return <div className="min-h-screen bg-gray-900 text-white p-8">Error: {error}</div>;
  if (!user) return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-300"
            >
              Quay lại
            </button>
            <h1 className="text-4xl font-bold text-yellow-400">Chi tiết người dùng</h1>
          </div>
          <button
            onClick={() => router.push(`/admin/users/${user.id}/edit`)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-300 shadow-lg"
          >
            Chỉnh sửa người dùng
          </button>
        </div>
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">ID</label>
              <p className="text-lg font-semibold">{user.id}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">Tên</label>
              <p className="text-lg">{user.firstName}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">Họ</label>
              <p className="text-lg">{user.lastName}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">Vai trò</label>
              <p className="text-lg capitalize">{user.role}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">Đã xác minh</label>
              <p className="text-lg">{user.isVerified ? 'Có' : 'Không'}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">VIP</label>
              <p className="text-lg">{user.vip ? 'Có' : 'Không'}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">Điểm đóng góp</label>
              <p className="text-lg">{user.contributionPoints}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Số lượt giới thiệu</label>
              <p className="text-lg">{user.referralCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
