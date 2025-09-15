import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
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

const FavoritePage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, userId } = useSelector((state) => state.auth);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !token) {
        setError('Vui lòng đăng nhập để xem danh sách yêu thích.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const favoritesResponse = await axios.get(`http://localhost:6969/api/favorites?page=1&limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favoriteSongs = favoritesResponse.data
          .filter((fav) => fav.song && fav.song.audio_url)
          .map((fav) => ({
            id: fav.song.id,
            title: fav.song.title,
            artist_name: fav.song.artist ? fav.song.artist.name : 'Không có nghệ sĩ',
            image_url: fav.song.image_url,
            audio_url: fav.song.audio_url,
            artist_id: fav.song.artist_id,
          }));
        setFavorites(favoriteSongs);
        dispatch(setCurrentSongList(favoriteSongs));
        setLoading(false);
        setHasMore(favoriteSongs.length === 5);
      } catch (err) {
        setError('Không thể tải danh sách yêu thích.');
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, token, dispatch]);

  const fetchMoreFavorites = async () => {
    try {
      const nextPage = page + 1;
      const response = await axios.get(`http://localhost:6969/api/favorites?page=${nextPage}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newFavorites = response.data
        .filter((fav) => fav.song && fav.song.audio_url)
        .map((fav) => ({
          id: fav.song.id,
          title: fav.song.title,
          artist_name: fav.song.artist ? fav.song.artist.name : 'Không có nghệ sĩ',
          image_url: fav.song.image_url,
          audio_url: fav.song.audio_url,
          artist_id: fav.song.artist_id,
        }));
      setFavorites(prevFavorites => [...prevFavorites, ...newFavorites]);
      setPage(nextPage);
      setHasMore(newFavorites.length === 5);
      dispatch(setCurrentSongList([...favorites, ...newFavorites]));
    } catch (err) {
      setError('Không thể tải thêm bài hát.');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8 pt-20 pb-24">
          <Header title="Bài Hát Yêu Thích" />
          {showLoginPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg">
                <p className="mb-4">Vui lòng đăng nhập để thêm bài hát vào danh sách yêu thích.</p>
                <div className="flex justify-end gap-4">
                  <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
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
          {loading && <p className="text-center text-gray-400">Đang tải...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {favorites.length > 0 ? (
            <InfiniteScroll
              dataLength={favorites.length}
              next={fetchMoreFavorites}
              hasMore={hasMore}
              loader={<div className="text-center text-gray-400">Đang tải thêm...</div>}
              endMessage={<div className="text-center text-gray-400">Đã tải hết bài hát.</div>}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Danh sách bài hát yêu thích</h2>
                <div className="flex flex-col gap-3">
                  {favorites.map((song) => (
                    <SongCard
                      key={song?.id || ''}
                      song={song}
                      songList={favorites}
                      setFavorites={setFavorites}
                      favorites={favorites}
                      setError={setError}
                      setShowLoginPopup={setShowLoginPopup}
                    />
                  ))}
                </div>
              </div>
            </InfiniteScroll>
          ) : (
            <p className="text-center text-gray-400">Bạn chưa có bài hát yêu thích nào.</p>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default FavoritePage;