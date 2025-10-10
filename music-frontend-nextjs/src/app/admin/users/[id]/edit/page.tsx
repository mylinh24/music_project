'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

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
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/admin/users/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/admin/users/${params.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('User updated successfully');
      setTimeout(() => router.push('/admin/users'), 2000);
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Failed to update user');
    }
  };

  if (error && !user) return <div className="min-h-screen bg-gray-900 text-white p-8">Error: {error}</div>;
  if (!user) return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Edit User</h1>
      {error && <div className="mb-4 p-4 bg-red-600 text-white rounded">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-600 text-white rounded">{success}</div>}
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-gray-700 text-white rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="bg-gray-700 text-white rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="bg-gray-700 text-white rounded px-3 py-2"
            required
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
            className="bg-gray-700 text-white rounded px-3 py-2"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isVerified}
              onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
              className="mr-2"
            />
            Verified
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.vip}
              onChange={(e) => setFormData({ ...formData, vip: e.target.checked })}
              className="mr-2"
            />
            VIP
          </label>
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-4"
        >
          Update User
        </button>
      </form>
    </div>
  );
};

export default AdminEditUser;
