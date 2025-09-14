import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { setCurrentSongList } from '../redux/playerSlice';
import Header from './Header';
import SongCard from './SongCard';

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <h1 className="text-red-500 text-center">Đã xảy ra lỗi.</h1>;
    }
    return this.props.children;
  }
}

const DEFAULT_ARTIST_IMAGE = 'https://via.placeholder.com/300x300?text=Artist';

const ArtistDetailPage = () => {
  const { artistId } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [artistData, setArtistData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [artistResponse, favoritesResponse] = await Promise.all([
          axios.get(`http://localhost:6969/api/artist/${artistId}`),
          isAuthenticated && token
            ? axios.get(`http://localhost:6969/api/favorites`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            : Promise.resolve({ data: [] }),
        ]);
        setArtistData(artistResponse.data);
        setFavorites(favoritesResponse.data.map((fav) => fav.song_id) || []);
        const validSongs = artistResponse.data.songs.filter(
          (song) => song && song.id && song.audio_url
        );
        dispatch(setCurrentSongList(validSongs));
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu ArtistDetailPage:', err);
        setError('Không thể tải dữ liệu.');
        setLoading(false);
      }
    };
    fetchData();
  }, [artistId, isAuthenticated, token, dispatch]);

  const isValidImageUrl = (url) => {
    return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
  };

  const safeArtist = artistData?.artist || {
    id: artistId,
    name: 'Nghệ sĩ không xác định',
    image_url: DEFAULT_ARTIST_IMAGE,
    total_listens: 0,
  };
  const safeSongs = artistData?.songs || [];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8 pt-20 pb-24">
          <Header title="Nghệ Sĩ" />

          {/* Popup yêu cầu đăng nhập */}
          {showLoginPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg">
                <p className="mb-4">
                  Vui lòng đăng nhập để thêm bài hát vào danh sách yêu thích.
                </p>
                <div className="flex justify-end gap-4">
                  <Link
                    to="/login"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Đăng nhập
                  </Link>
                  <button
                    onClick={() => setShowLoginPopup(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading + Error */}
          {loading && (
            <p className="text-center text-gray-400">Đang tải...</p>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}

          {/* Thông tin nghệ sĩ */}
          <div className="flex flex-col items-center gap-6 mb-12 justify-center">
            <img
              src={
                isValidImageUrl(safeArtist.image_url)
                  ? safeArtist.image_url
                  : DEFAULT_ARTIST_IMAGE
              }
              alt={safeArtist.name}
              className="w-48 h-48 rounded-full object-cover"
              onError={(e) => (e.target.src = DEFAULT_ARTIST_IMAGE)}
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
              <div className="flex flex-col gap-3">
                {safeSongs.map((song) => (
                  <SongCard
                    key={song?.id || ''}
                    song={song}
                    songList={safeSongs}
                    setFavorites={setFavorites}
                    favorites={favorites}
                    setError={setError}
                    setShowLoginPopup={setShowLoginPopup}
                  />
                ))}
              </div>
            </section>
          ) : (
            !loading && (
              <p className="text-center text-gray-400">
                Không có bài hát nào của nghệ sĩ này.
              </p>
            )
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ArtistDetailPage;