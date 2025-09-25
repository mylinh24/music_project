import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminEditArtist = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:6969/api/admin/artists/${artistId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          name: response.data.name || '',
          image_url: response.data.image_url || '',
        });
        setLoading(false);
      } catch (err) {
        setError('Lỗi khi tải dữ liệu nghệ sĩ.');
        setLoading(false);
        console.error('Error fetching artist:', err);
      }
    };
    if (artistId) {
      fetchArtist();
    }
  }, [artistId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:6969/api/admin/artists/${artistId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/admin/artists');
    } catch (err) {
      setError('Lỗi khi cập nhật nghệ sĩ. Vui lòng thử lại.');
      console.error('Error updating artist:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center text-gray-400">Đang tải...</p>;
  if (error && !formData.name) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <button
          onClick={() => navigate('/admin/artists')}
          className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
        >
          ← Quay lại danh sách nghệ sĩ
        </button>
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Chỉnh Sửa Nghệ Sĩ</h1>
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
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition-colors disabled:opacity-50"
            >
              {saving ? 'Đang cập nhật...' : 'Cập Nhật Nghệ Sĩ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditArtist;
