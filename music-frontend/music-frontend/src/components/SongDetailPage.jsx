import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Pause, SkipForward, SkipBack, Heart } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
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

const SongDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [songData, setSongData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [menuOpen, setMenuOpen] = useState(false);
  const [volume, setVolume] = useState(1); // Volume ranges from 0 to 1
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // Default playback speed is 1x
  const audioRef = useRef(null);
  const menuRef = useRef(null);

  // Format time from seconds to mm:ss
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle playback speed change
  const handlePlaybackSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  useEffect(() => {
    const fetchSongDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:6969/api/song/${id}`);
        setSongData(response.data);
        setCurrentSong(response.data);
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
  }, [id]);

  // Fetch favorites if authenticated
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

  // Fetch user info if authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      const fetchUserInfo = async () => {
        try {
          const response = await axios.get(`http://localhost:6969/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFullName(`${response.data.firstName || ''} ${response.data.lastName || ''}`.trim() || 'Người dùng');
          setAvatarUrl(response.data.avatar || DEFAULT_AVATAR);
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      };
      fetchUserInfo();
    }
  }, [isAuthenticated, token]);

  // Close menu if clicked outside
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

  // Handle audio playback and progress
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
        // Auto-play next song in artist's list
        handleNextSong();
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);

      if (currentSong && !audio.src.includes(currentSong.audio_url)) {
        audio.src = currentSong.audio_url;
        audio.volume = volume; // Set initial volume
        audio.playbackRate = playbackSpeed; // Set initial playback speed
        if (isPlaying) {
          audio.play().catch((err) =>
            setError('Không thể phát âm thanh. Vui lòng kiểm tra URL hoặc kết nối.')
          );
        }
      } else if (isPlaying && audio.paused) {
        audio.volume = volume; // Update volume
        audio.playbackRate = playbackSpeed; // Update playback speed
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
  }, [isPlaying, currentSong, volume, playbackSpeed]);

  const handlePlayPause = () => {
    if (!currentSong?.audio_url) {
      setError('Không tìm thấy URL âm thanh.');
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextSong = () => {
    if (!songData?.artist_songs) return;
    const currentIndex = songData.artist_songs.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songData.artist_songs.length;
    const nextSong = songData.artist_songs[nextIndex];
    setCurrentSong(nextSong);
    setIsPlaying(true);
  };

  const handlePrevSong = () => {
    if (!songData?.artist_songs) return;
    const currentIndex = songData.artist_songs.findIndex(song => song.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? songData.artist_songs.length - 1 : currentIndex - 1;
    const prevSong = songData.artist_songs[prevIndex];
    setCurrentSong(prevSong);
    setIsPlaying(true);
  };

  const handleProgressChange = (e) => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(e.target.value);
    }
  };

  const handleFavoriteToggle = async (song, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để thêm vào danh sách yêu thích.');
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

  const handleSongClick = (songId) => {
    navigate(`/song/${songId}`);
  };

  const handleArtistClick = (artistId) => {
    navigate(`/artist/${artistId}`);
  };

  const isValidImageUrl = (url) => {
    return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
  };

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    navigate('/');
  };

  if (loading) return <p className="text-center text-gray-400">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* User Info Header */}
        {isAuthenticated ? (
          <div className="flex justify-between items-center bg-gray-800 p-4">
            <div className="flex items-center space-x-4">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => (e.target.src = DEFAULT_AVATAR)}
              />
              <span className="text-green-500 font-semibold">{fullName}</span>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-green-500 hover:text-green-400 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Hồ sơ
                  </Link>
                  <Link
                    to="/favorites"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Yêu thích
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-end p-4">
            <Link to="/login" className="text-green-500 hover:text-green-400 font-semibold">
              Đăng nhập
            </Link>
          </div>
        )}
        <div className="container mx-auto p-6">
          {songData && (
            <>
              {/* Song Header */}
              <div className="mb-8 text-center">
                <img
                  src={isValidImageUrl(songData.image_url) ? songData.image_url : 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={songData.title}
                  className="w-64 h-64 object-cover rounded-lg mx-auto mb-4"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/300x300?text=No+Image')}
                />
                <h1 className="text-4xl font-bold">{songData.title}</h1>
                <p
                  className="text-xl text-gray-400 cursor-pointer hover:text-white"
                  onClick={() => handleArtistClick(songData.artist.id)}
                >
                  {songData.artist.name}
                </p>
                <p className="text-gray-500">Lượt nghe: {songData.listen_count}</p>
                <button
                  className="mt-4 bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 flex items-center mx-auto"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                  {isPlaying ? 'Tạm dừng' : 'Phát'}
                </button>
              </div>

              {/* Lyrics */}
              {songData.lyrics && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Lời bài hát</h2>
                  <div className="bg-gray-800 p-6 rounded-lg whitespace-pre-line">
                    {songData.lyrics}
                  </div>
                </div>
              )}

              {/* Artist Songs */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Bài hát khác của {songData.artist.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {songData.artist_songs.map((song) => (
                    <div
                      key={song.id}
                      className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200"
                      onClick={() => handleSongClick(song.id)}
                    >
                      {song.image_url && (
                        <img
                          src={isValidImageUrl(song.image_url) ? song.image_url : 'https://via.placeholder.com/200x200?text=No+Image'}
                          alt={song.title}
                          className="w-full h-40 object-cover"
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/200x200?text=No+Image')}
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-white font-semibold truncate">{song.title}</h3>
                        <p className="text-gray-400 text-sm">Lượt nghe: {song.listen_count}</p>
                      </div>
                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSong(song);
                          setIsPlaying(true);
                        }}
                      >
                        <button className="bg-green-500 text-white rounded-full p-3 hover:bg-green-600">
                          <Play className="w-6 h-6" />
                        </button>
                      </div>
                      <button
                        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity duration-200"
                        onClick={(e) => handleFavoriteToggle(song, e)}
                      >
                        <Heart
                          className={`w-5 h-5 ${favorites.includes(song.id) ? 'text-red-500 fill-red-500' : 'text-white'}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Audio Player Footer */}
        {currentSong && (
          <div className="fixed bottom-0 left-0 w-full bg-gray-800 p-2 flex items-center justify-between z-50">
            <div className="flex items-center cursor-pointer hover:bg-gray-700 p-2 rounded" onClick={() => navigate(`/song/${currentSong.id}`)}>
              <img
                src={isValidImageUrl(currentSong.image_url) ? currentSong.image_url : 'https://via.placeholder.com/50x50?text=No+Image'}
                alt={currentSong.title}
                className="w-12 h-12 object-cover rounded-md mr-3"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/50x50?text=No+Image')}
              />
              <div>
                <h3 className="text-white font-semibold truncate w-32">{currentSong.title}</h3>
                <p className="text-gray-400 text-sm">{currentSong.artist_name || songData?.artist.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="text-gray-400 hover:text-white"
                onClick={handlePrevSong}
              >
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                className="text-gray-400 hover:text-white"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button
                className="text-gray-400 hover:text-white"
                onClick={handleNextSong}
              >
                <SkipForward className="w-6 h-6" />
              </button>
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
              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Âm lượng</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume * 100}
                  onChange={handleVolumeChange}
                  className="w-16"
                />
              </div>
              {/* Playback Speed Control */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Tốc độ</span>
                <select
                  value={playbackSpeed}
                  onChange={handlePlaybackSpeedChange}
                  className="bg-gray-700 text-white rounded p-1"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>
            </div>
            <audio ref={audioRef} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SongDetailPage;