'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const VerifyOtp = () => {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const userId = localStorage.getItem('resetUserId');
    if (!userId) {
      setError('User ID not found. Please restart the forgot password process.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/auth/reset-password', {
        userId: parseInt(userId),
        otp,
        newPassword,
      });
      if (response.status >= 200 && response.status < 300) {
        localStorage.removeItem('resetUserId');
        setMessage('Đặt lại mật khẩu thành công.');
        // Optionally redirect to login page after a delay
        setTimeout(() => {
          router.push('/admin/login');
        }, 3000);
      } else {
        setError('OTP verification failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Đặt lại mật khẩu
        </h2>
        <form onSubmit={handleVerify}>
          <div className="mb-4">
            <label className="block text-gray-300">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Nhập OTP"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Nhập mật khẩu mới"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-400 text-white p-2 rounded hover:bg-green-500"
          >
            Đặt lại mật khẩu
          </button>
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
          <div className="mt-4 text-center">
            <Link href="/admin/login" className="text-green-400 hover:underline">Quay lại đăng nhập</Link>
          </div>
        </form>
        {message && <p className="mt-4 text-green-400 text-center">{message}</p>}
      </div>
    </div>
  );
};

export default VerifyOtp;
