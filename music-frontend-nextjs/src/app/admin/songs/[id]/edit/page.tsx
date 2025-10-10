'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

interface Song {
  id: number;
  title: string;
  artist: { id: number; name: string };
  category: { id: number; name: string };
  listenCount: number;
  audio_url: string;
  image_url: string;
  lyrics: string;
  release_date: string;
  exclusive: boolean;
}

interface Artist {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

const AdminEditSong = () => {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    audio_url: '',
    image_url: '',
    lyrics: '',
    artist_id: '',
    category_id: '',
    release_date: '',
    exclusive: false,
  });
  const [artists, setArtists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [songRes, artistsRes, categoriesRes] = await Promise.all([
          axios.get(`http://localhost:3001/admin/songs/${params.id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3001/admin/artists', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3001/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const song = songRes.data;
        setFormData({
          title: song.title,
          audio_url: song.audio_url,
          image_url: song.image_url || '',
          lyrics: song.lyrics || '',
          artist_id: song.artist ? song.artist.id.toString() : '',
          category_id: song.category ? song.category.id.toString() : '',
          release_date: song.release_date ? song.release_date.split('T')[0] : '',
          exclusive: song.exclusive,
        });
        setArtists(artistsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Lỗi khi tải dữ liệu bài hát.');
      }
    };
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

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
      await axios.put(`http://localhost:3001/admin/songs/${params.id}`, {
        ...formData,
        artist_id: parseInt(formData.artist_id),
        category_id: parseInt(formData.category_id),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/admin/songs');
    } catch (err: any) {
      setError('Lỗi khi cập nhật bài hát. Vui lòng thử lại.');
      console.error('Error updating song:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <button
          onClick={() => router.back()}
          className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
        >
          ← Quay lại
        </button>
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Chỉnh Sửa Bài Hát</h1>
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
                {artists.map((artist: Artist) => (
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
                {categories.map((category: Category) => (
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
              {saving ? 'Đang cập nhật...' : 'Cập Nhật Bài Hát'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditSong;
