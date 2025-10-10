'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface Artist {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

const AdminAddSong = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    audio_url: '',
    artist_id: '',
    category_id: '',
    image_url: '',
    lyrics: '',
    release_date: '',
    exclusive: false,
  });
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [artistsRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:3001/admin/artists', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3001/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setArtists(artistsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/admin/songs', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/admin/songs');
    } catch (err: any) {
      setError('Lỗi khi thêm bài hát. Vui lòng thử lại.');
      console.error('Error adding song:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <Link href="/admin/songs" className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors inline-block">
          ← Quay lại danh sách bài hát
        </Link>
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Thêm Bài Hát Mới</h1>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tên Bài Hát</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Nhập tên bài hát"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">URL Audio</label>
              <input
                type="url"
                name="audio_url"
                value={formData.audio_url}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Nhập URL audio"
              />
            </div>
            <div className="mb-4">
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
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Lời Bài Hát</label>
              <textarea
                name="lyrics"
                value={formData.lyrics}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="Nhập lời bài hát"
                rows={4}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Nghệ Sĩ</label>
              <select
                name="artist_id"
                value={formData.artist_id}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="">Chọn nghệ sĩ</option>
                {artists.map(artist => (
                  <option key={artist.id} value={artist.id}>{artist.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Thể Loại</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="">Chọn thể loại</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Ngày Phát Hành</label>
              <input
                type="date"
                name="release_date"
                value={formData.release_date}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="exclusive"
                  checked={formData.exclusive}
                  onChange={handleChange}
                  className="mr-2"
                />
                Bài hát độc quyền
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition-colors disabled:opacity-50"
            >
              {saving ? 'Đang thêm...' : 'Thêm Bài Hát'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddSong;
