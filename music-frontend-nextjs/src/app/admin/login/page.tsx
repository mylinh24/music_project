'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AdminLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:3001/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Đăng nhập Admin</h1>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-6 p-3 rounded bg-gray-700 text-white"
        />
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded font-semibold">
          Đăng nhập
        </button>
        <div className="mt-4 text-center">
          <a href="/admin/forgot-password" className="text-blue-400 hover:underline">
            Quên mật khẩu?
          </a>
        </div>
        <div className="mt-2 text-center">
          <a href="/admin/register" className="text-blue-400 hover:underline">
            Đăng ký
          </a>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
