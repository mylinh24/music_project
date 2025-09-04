import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, Pause, SkipForward, SkipBack, Heart } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { logout } from '../redux/authSlice';

// Error Boundary Component
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

const DEFAULT_AVATAR = 'https://via.placeholder.com/50x50?text=Avatar';

const Favorite = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, userId, token } = useSelector((state) => state.auth);
  const [favorites, setFavorites] = useState([]);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Định dạng thời gian từ giây sang mm:ss
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Lấy danh sách bài hát yêu thích và thông tin người dùng
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !userId || !token) {
        setError('Vui lòng đăng nhập để xem danh sách yêu thích.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const requests = [
          axios.get(`http://localhost:6969/api/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:6969/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ];

        const [favoritesResponse, userInfo] = await Promise.all(requests);

        if (favoritesResponse.data && Array.isArray(favoritesResponse.data)) {
          setFavorites(favoritesResponse.data.map(fav => ({
            id: fav.song.id,
            title: fav.song.title,
            artist_name: fav.song.artist?.name || 'Không có nghệ sĩ',
            image_url: fav.song.image_url,
            audio_url: fav.song.audio_url,
          })));
        } else {
          setFavorites([]);
        }

        if (userInfo) {
          setFullName(`${userInfo.data.firstName || ''} ${userInfo.data.lastName || ''}`.trim() || 'Người dùng');
          setAvatarUrl(userInfo.data.avatar || DEFAULT_AVATAR);
        }

        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu:', err);
        setError('Không thể tải danh sách yêu thích. Vui lòng kiểm tra kết nối hoặc thử lại sau.');
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, userId, token]);

  // Đóng menu nếu click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Xử lý phát nhạc và tiến trình
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleTimeUpdate = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);

      if (currentSong && !audio.src.includes(currentSong.audio_url)) {
        audio.src = currentSong.audio_url;
        if (isPlaying) {
          audio.play().catch((err) =>
            setError('Không thể phát âm thanh. Vui lòng kiểm tra URL hoặc kết nối.')
          );
        }
      } else if (isPlaying && audio.paused) {
        audio.play().catch((err) =>
          setError('Không thể phát âm thanh. Vui lòng kiểm tra URL hoặc kết nối.')
        );
      } else if (!isPlaying && !audio.paused) {
        audio.pause();
      }

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [isPlaying, currentSong]);

  const isValidImageUrl = (url) => {
    return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
  };

  const handlePlayPause = (song) => {
    if (!song?.audio_url) {
      setError('Không tìm thấy URL âm thanh.');
      return;
    }
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handleFavoriteToggle = async (song, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (favorites.some(fav => fav.id === song.id)) {
        await axios.delete(`http://localhost:6969/api/favorites`, {
          data: { song_id: song.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(favorites.filter(fav => fav.id !== song.id));
      } else {
        await axios.post(
          `http://localhost:6969/api/favorites`,
          { song_id: song.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites([...favorites, song]);
      }
    } catch (err) {
      console.error('Lỗi khi thay đổi yêu thích:', err);
      setError('Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.');
    }
  };

  const handleCardClick = (songId) => {
    navigate(`/song/${songId}`);
  };

  const handleProgressChange = (e) => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(e.target.value);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    navigate('/');
  };

  const renderSongCard = (song) => (
    <div
      className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200 w-48"
      onClick={() => handleCardClick(song?.id || '')}
    >
      {song?.image_url && (
        <img
          src={isValidImageUrl(song.image_url) ? song.image_url : 'https://via.placeholder.com/200x200?text=No+Image'}
          alt={song?.title || 'No title'}
          className="w-full h-40 object-cover"
          onError={(e) => (e.target.src = 'https://via.placeholder.com/200x200?text=No+Image')}
        />
      )}
      <div className="p-4">
        <h3 className="text-white font-semibold truncate">{song?.title || 'Không có tiêu đề'}</h3>
        <p className="text-gray-400 text-sm">{song?.artist_name || 'Không có nghệ sĩ'}</p>
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => {
          e.stopPropagation();
          handlePlayPause(song);
        }}
      >
        <button className="bg-green-500 text-white rounded-full p-3 hover:bg-green-600">
          {currentSong?.id === song.id && isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
      </div>
      <button
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity duration-200"
        onClick={(e) => handleFavoriteToggle(song, e)}
      >
        <Heart
          className={`w-5 h-5 ${favorites.some(fav => fav.id === song.id) ? 'text-red-500 fill-red-500' : 'text-white'}`}
        />
      </button>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Bài Hát Yêu Thích</h1>
            <div className="relative" ref={menuRef}>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                  />
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-green-500 hover:underline font-semibold"
                  >
                    {fullName || 'Tài khoản'}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-white hover:bg-gray-700"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/favorites"
                        className="block px-4 py-2 text-white hover:bg-gray-700"
                        onClick={() => setMenuOpen(false)}
                      >
                        Bài hát yêu thích của tôi
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="text-green-500 hover:underline font-semibold">
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && <p className="text-center text-gray-400">Đang tải...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {/* Favorites Section */}
          {isAuthenticated && favorites.length > 0 ? (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Danh Sách Yêu Thích</h2>
              <Swiper
                modules={[Navigation, Pagination, Mousewheel]}
                spaceBetween={16}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                mousewheel={{ forceToAxis: true }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                }}
              >
                {favorites.map((song) => (
                  <SwiperSlide key={song?.id || ''}>{renderSongCard(song)}</SwiperSlide>
                ))}
              </Swiper>
            </section>
          ) : isAuthenticated ? (
            <p className="text-center text-gray-400">Bạn chưa có bài hát yêu thích nào.</p>
          ) : null}

          {/* Audio Player at Footer */}
          {currentSong && (
            <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-2 flex items-center justify-between z-50">
              <div className="flex items-center">
                <img
                  src={isValidImageUrl(currentSong.image_url) ? currentSong.image_url : 'https://via.placeholder.com/50x50?text=No+Image'}
                  alt={currentSong.title}
                  className="w-12 h-12 object-cover rounded-md mr-3"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/50x50?text=No+Image')}
                />
                <div>
                  <h3 className="text-white font-semibold truncate w-32">{currentSong.title}</h3>
                  <p className="text-gray-400 text-sm">{currentSong.artist_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <SkipBack className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                <SkipForward className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                <div className="text-gray-400 text-sm">
                  {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(audioRef.current?.duration || 0)}
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-24"
                />
              </div>
              <audio ref={audioRef} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Favorite;