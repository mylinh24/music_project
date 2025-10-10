'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      // Gọi API quên mật khẩu
      const response = await axios.post('http://localhost:3001/auth/forgot-password', { email });
      localStorage.setItem('resetUserId', response.data.userId.toString());
      setMessage('OTP đã được gửi. Vui lòng kiểm tra email.');
      router.push('/admin/forgot-password/verify-otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Quên mật khẩu
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Nhập email"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-400 text-white p-2 rounded hover:bg-green-500"
          >
            Gửi OTP
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

export default ForgotPassword;
