import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setCurrentSongList } from '../redux/playerSlice';

const AdminArtistDetail = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:6969/api/artist/${artistId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArtistData(response.data);
        const validSongs = response.data.songs?.filter((song) => song && song.id && song.audio_url) || [];
        dispatch(setCurrentSongList(validSongs));
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu ArtistDetailPage:', err);
        setError('Không thể tải dữ liệu.');
        setLoading(false);
      }
    };
    if (artistId && token) {
      fetchData();
    }
  }, [artistId, token, dispatch]);

  const isValidImageUrl = (url) => {
    return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
  };

  const safeArtist = artistData?.artist || {
    id: artistId,
    name: 'Nghệ sĩ không xác định',
    image_url: 'https://via.placeholder.com/300x300?text=Artist',
    total_listens: 0,
  };
  const safeSongs = artistData?.songs || [];

  if (loading) return <p className="text-center text-gray-400">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <button
          onClick={() => navigate('/admin/artists')}
          className="mb-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
        >
          ← Quay lại danh sách nghệ sĩ
        </button>
        {/* Thông tin nghệ sĩ */}
        <div className="flex flex-col items-center gap-6 mb-12 justify-center">
          <img
            src={
              isValidImageUrl(safeArtist.image_url)
                ? safeArtist.image_url
                : 'https://via.placeholder.com/300x300?text=Artist'
            }
            alt={safeArtist.name}
            className="w-48 h-48 rounded-full object-cover"
            onError={(e) => (e.target.src = 'https://via.placeholder.com/300x300?text=Artist')}
          />
          <div>
            <h2 className="text-3xl font-bold">{safeArtist.name}</h2>
            {safeArtist.total_listens > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Tổng lượt nghe: {safeArtist.total_listens.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Danh sách bài hát */}
        {safeSongs.length > 0 ? (
          <section className="mb-12">
            <h3 className="text-2xl font-bold mb-4">Danh Sách Bài Hát</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {safeSongs.map((song) => (
                <div key={song.id} className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                  <img
                    src={isValidImageUrl(song.image_url) ? song.image_url : 'https://via.placeholder.com/150x150?text=No+Image'}
                    alt={song.title}
                    className="w-full h-32 object-cover rounded mb-2"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/150x150?text=No+Image')}
                  />
                  <h4 className="font-semibold">{song.title}</h4>
                  <p className="text-gray-400 text-sm">Lượt nghe: {song.listen_count}</p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <p className="text-center text-gray-400">
            Không có bài hát nào của nghệ sĩ này.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminArtistDetail;
