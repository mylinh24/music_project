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

const AdminUserDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3000/admin/users/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Details</h1>
        <button
          onClick={() => router.push(`/admin/users/${user.id}/edit`)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          Edit User
        </button>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>First Name:</strong> {user.firstName}</p>
        <p><strong>Last Name:</strong> {user.lastName}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
        <p><strong>VIP:</strong> {user.vip ? 'Yes' : 'No'}</p>
        <p><strong>Contribution Points:</strong> {user.contributionPoints}</p>
        <p><strong>Referral Count:</strong> {user.referralCount}</p>
      </div>
    </div>
  );
};

export default AdminUserDetail;
