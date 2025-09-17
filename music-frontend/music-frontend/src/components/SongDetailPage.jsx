import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, Pause, Crown } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { setCurrentSong, setIsPlaying, setCurrentSongList, setCurrentSongIndex } from '../redux/playerSlice';
import Header from './Header';
import BigSongCard from './BigSongCard';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center text-red-500 p-6">
          <h2 className="text-2xl font-bold">Đã xảy ra lỗi</h2>
          <p>Xin vui lòng thử lại sau hoặc liên hệ hỗ trợ.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SongDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const { currentSong, isPlaying } = useSelector((state) => state.player);
  const [songData, setSongData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    const fetchSongDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:6969/api/song/${id}`);
        setSongData(response.data);
        const validSongs = response.data.artist_songs?.filter(song => song && song.id && song.audio_url) || [];
        dispatch(setCurrentSongList(validSongs));
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch song detail:', err);
        setError('Không thể tải chi tiết bài hát. Vui lòng thử lại.');
        setLoading(false);
      }
    };
    if (id) {
      fetchSongDetail();
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (isAuthenticated && token) {
      const fetchFavorites = async () => {
        try {
          const response = await axios.get(`http://localhost:6969/api/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFavorites(response.data.map(fav => fav.song_id));
        } catch (error) {
          console.error('Error fetching favorites:', error);
        }
      };
      fetchFavorites();
    }
  }, [isAuthenticated, token]);

  const handlePlayPause = () => {
    if (!songData?.audio_url) {
      setError('Không tìm thấy URL âm thanh.');
      return;
    }
    if (currentSong?.id === songData.id) {
      dispatch(setIsPlaying(!isPlaying));
    } else {
      dispatch(setCurrentSong(songData));
      dispatch(setCurrentSongList(songData.artist_songs || []));
      dispatch(setCurrentSongIndex(songData.artist_songs?.findIndex(s => s.id === songData.id) || 0));
      dispatch(setIsPlaying(true));
    }
  };

  const handleSongPlay = (song) => {
    if (currentSong?.id === song.id) {
      dispatch(setIsPlaying(!isPlaying));
    } else {
      dispatch(setCurrentSong(song));
      dispatch(setCurrentSongList(songData.artist_songs || []));
      dispatch(setCurrentSongIndex(songData.artist_songs?.findIndex(s => s.id === song.id) || 0));
      dispatch(setIsPlaying(true));
    }
  };

  const handleFavoriteToggle = async (song, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowLoginPopup(true);
      return;
    }
    try {
      if (favorites.includes(song.id)) {
        await axios.delete(`http://localhost:6969/api/favorites`, {
          data: { song_id: song.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(favorites.filter(id => id !== song.id));
      } else {
        await axios.post(
          `http://localhost:6969/api/favorites`,
          { song_id: song.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites([...favorites, song.id]);
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
      setError('Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.');
    }
  };

  const handleArtistClick = (artistId) => {
    navigate(`/artist/${artistId}`);
  };

  const isValidImageUrl = (url) => {
    return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
  };

  if (loading) return <p className="text-center text-gray-400">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8 pt-20 pb-24">
          <Header title="Website Nghe Nhạc Trực Tuyến" />
          {songData && (
            <>
              <div className="mb-8 text-center cursor-pointer" onClick={() => navigate(`/song/${songData?.id || ''}`)}>
                <div className="relative inline-block">
                  <img
                    src={isValidImageUrl(songData.image_url) ? songData.image_url : 'https://via.placeholder.com/300x300?text=No+Image'}
                    alt={songData.title}
                    className="w-64 h-64 object-cover rounded-lg mx-auto mb-4"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/300x300?text=No+Image')}
                  />
                  {songData?.exclusive && (
                    <Crown className="absolute top-2 left-2 w-8 h-8 text-yellow-500" />
                  )}
                </div>
                <h1 className="text-4xl font-bold">{songData.title}</h1>
                <p
                  className="text-xl text-gray-400 cursor-pointer hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArtistClick(songData.artist.id);
                  }}
                >
                  {songData.artist.name}
                </p>
                <p className="text-gray-500">Lượt nghe: {songData.listen_count}</p>
                <p className="text-gray-500">Thể loại: {songData.category_name}</p>
                <button
                  className="mt-4 bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 flex items-center mx-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause();
                  }}
                >
                  {currentSong?.id === songData.id && isPlaying ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                  {currentSong?.id === songData.id && isPlaying ? 'Tạm dừng' : 'Phát'}
                </button>
              </div>
              {songData.lyrics && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Lời bài hát</h2>
                  <div className="bg-gray-800 p-6 rounded-lg whitespace-pre-line">
                    {songData.lyrics}
                  </div>
                </div>
              )}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Bài hát khác của {songData.artist.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {songData.artist_songs.map((song) => (
                    <BigSongCard
                      key={song.id}
                      song={song}
                      songList={songData.artist_songs}
                      favorites={favorites}
                      handleFavoriteToggle={handleFavoriteToggle}
                      setError={setError}
                      showListenCount={true}
                      onPlay={handleSongPlay}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        {showLoginPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">Yêu cầu đăng nhập</h2>
              <p className="mb-6">Bạn cần đăng nhập để thêm bài hát vào danh sách yêu thích.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowLoginPopup(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => {
                    setShowLoginPopup(false);
                    navigate('/login');
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SongDetailPage;