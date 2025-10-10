'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const AdminAddArtist = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/admin/artists', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/admin/artists');
    } catch (err: any) {
      setError('Lỗi khi thêm nghệ sĩ. Vui lòng thử lại.');
      console.error('Error adding artist:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <Link href="/admin/artists" className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors inline-block">
          ← Quay lại danh sách nghệ sĩ
        </Link>
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Thêm Nghệ Sĩ Mới</h1>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tên Nghệ Sĩ</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Nhập tên nghệ sĩ"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">URL Hình Ảnh</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Nhập URL hình ảnh"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang thêm...' : 'Thêm Nghệ Sĩ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddArtist;
