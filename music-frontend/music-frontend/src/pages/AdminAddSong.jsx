import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminAddSong = () => {
  const navigate = useNavigate();
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
        const [artistsRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:6969/api/admin/artists', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:6969/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setArtists(artistsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:6969/api/admin/songs', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/admin/songs');
    } catch (err) {
      setError('Lỗi khi thêm bài hát. Vui lòng thử lại.');
      console.error('Error adding song:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <button
          onClick={() => navigate('/admin/songs')}
          className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
        >
          ← Quay lại danh sách bài hát
        </button>
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
                rows="4"
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
