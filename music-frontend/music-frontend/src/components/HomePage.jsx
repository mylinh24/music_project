<<<<<<< HEAD
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');

  // Danh sách bài hát mẫu
  const songs = [
    { id: 1, title: 'Hơi Thở Của Gió', artist: 'Ca sĩ A', url: 'https://example.com/song1.mp3', genre: 'Ballad' },
    { id: 2, title: 'Mùa Hè Rực Rỡ', artist: 'Ca sĩ B', url: 'https://example.com/song2.mp3', genre: 'Pop' },
    { id: 3, title: 'Đêm Thành Phố', artist: 'Ca sĩ C', url: 'https://example.com/song3.mp3', genre: 'Rock' },
  ];

  // Lọc bài hát dựa trên tìm kiếm
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Website Nghe Nhạc Trực Tuyến</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/profile" className="text-blue-500 hover:underline font-semibold">
                Tài khoản
              </Link>
            ) : (
              <Link to="/login" className="text-blue-500 hover:underline font-semibold">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài hát, ca sĩ, hoặc thể loại..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Danh sách bài hát */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => (
              <div
                key={song.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-800">{song.title}</h3>
                <p className="text-gray-600">{song.artist}</p>
                <p className="text-sm text-gray-500">Thể loại: {song.genre}</p>
                <audio controls className="w-full mt-3">
                  <source src={song.url} type="audio/mpeg" />
                  Trình duyệt của bạn không hỗ trợ phát âm thanh.
                </audio>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full">Không tìm thấy bài hát nào.</p>
          )}
        </div>
      </div>
    </div>
=======
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

const HomePage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, userId, token } = useSelector((state) => state.auth);
  const [latestSongs, setLatestSongs] = useState([]);
  const [popularSongs, setPopularSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [favorites, setFavorites] = useState([]); // State for favorites
  const [showLoginPopup, setShowLoginPopup] = useState(false); // State for login popup
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSongList, setCurrentSongList] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [volume, setVolume] = useState(1); // Volume ranges from 0 to 1
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // Default playback speed is 1x
  const menuRef = useRef(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();

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

  // Fetch data for all sections và họ tên người dùng
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const requests = [
          axios.get('http://localhost:6969/api/latest-songs?limit=8'),
          axios.get('http://localhost:6969/api/popular-songs?limit=6'),
          axios.get('http://localhost:6969/api/trending-songs?limit=10'),
          isAuthenticated && userId ? axios.get(`http://localhost:6969/api/recently-played?user_id=${userId}&limit=8`) : Promise.resolve({ data: [] }),
          axios.get('http://localhost:6969/api/top-artists?limit=8'),
        ];

        if (isAuthenticated && token) {
          requests.push(axios.get(`http://localhost:6969/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }));
          // Fetch favorites
          requests.push(axios.get(`http://localhost:6969/api/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          }));
        }

        const [latest, popular, trending, recent, artist, userInfo, favoritesResponse] = await Promise.all(requests);

        setLatestSongs(latest.data || []);
        setPopularSongs(popular.data || []);
        setTrendingSongs(trending.data || []);
        setRecentlyPlayed(recent.data || []);
        setArtists(artist.data || []);
        if (userInfo) {
          setFullName(`${userInfo.data.firstName || ''} ${userInfo.data.lastName || ''}`.trim() || 'Người dùng');
          setAvatarUrl(userInfo.data.avatar || DEFAULT_AVATAR);
        }
        if (favoritesResponse && favoritesResponse.data && Array.isArray(favoritesResponse.data)) {
          setFavorites(favoritesResponse.data.map(fav => fav.song_id));
        } else {
          setFavorites([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc thử lại sau.');
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, userId, token]);

  // Add effect to refetch recently played when userId changes (e.g., after login)
  React.useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      if (isAuthenticated && userId && token) {
        try {
          const response = await axios.get(`http://localhost:6969/api/recently-played?user_id=${userId}&limit=8`);
          setRecentlyPlayed(response.data || []);
        } catch (error) {
          console.error('Error fetching recently played:', error);
        }
      } else {
        setRecentlyPlayed([]);
      }
    };
    fetchRecentlyPlayed();
  }, [isAuthenticated, userId, token]);

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
        // Auto-play next song in the list
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

  const isValidImageUrl = (url) => {
    return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
  };

  const handlePlayPause = (song, songList = []) => {
    if (!song?.audio_url) {
      setError('Không tìm thấy URL âm thanh.');
      return;
    }
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      if (songList.length > 0) {
        setCurrentSongList(songList);
        setCurrentSongIndex(songList.findIndex(s => s.id === song.id));
      }
    }
  };

  // Handle favorite toggle
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

  const handleCardClick = (songId) => {
    if (!songId) return;
    navigate(`/song/${songId}`);
  };

  const handleArtistClick = (artistId) => {
    if (!artistId) return;
    navigate(`/artist/${artistId}`);
  };

  const handleProgressChange = (e) => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(e.target.value);
    }
  };

  const handleNextSong = () => {
    if (currentSongList.length === 0 || currentSongIndex === -1) return;
    const nextIndex = (currentSongIndex + 1) % currentSongList.length;
    const nextSong = currentSongList[nextIndex];
    setCurrentSong(nextSong);
    setCurrentSongIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrevSong = () => {
    if (currentSongList.length === 0 || currentSongIndex === -1) return;
    const prevIndex = currentSongIndex === 0 ? currentSongList.length - 1 : currentSongIndex - 1;
    const prevSong = currentSongList[prevIndex];
    setCurrentSong(prevSong);
    setCurrentSongIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    navigate('/');
  };

  const closeLoginPopup = () => {
    setShowLoginPopup(false);
  };

  const renderSongCard = (song) => (
    <div
      className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200 w-48 cursor-pointer"
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
      <button
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-green-500 text-white rounded-full p-3 hover:bg-green-600"
        onClick={(e) => {
          e.stopPropagation();
          // Determine which list the song belongs to and pass it
          let songList = [];
          if (trendingSongs.some(s => s.id === song.id)) songList = trendingSongs;
          else if (latestSongs.some(s => s.id === song.id)) songList = latestSongs;
          else if (popularSongs.some(s => s.id === song.id)) songList = popularSongs;
          else if (recentlyPlayed.some(s => s.id === song.id)) songList = recentlyPlayed;
          handlePlayPause(song, songList);
        }}
      >
        {currentSong?.id === song.id && isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
      </button>
      <button
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity duration-200"
        onClick={(e) => handleFavoriteToggle(song, e)}
      >
        <Heart
          className={`w-5 h-5 ${favorites.includes(song.id) ? 'text-red-500 fill-red-500' : 'text-white'}`}
        />
      </button>
    </div>
  );

  const renderArtistCard = (artist) => (
    <div
      className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200 w-48 text-center"
      onClick={() => handleArtistClick(artist?.id || '')}
    >
      <div className="p-4">
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden">
          <img
            src={isValidImageUrl(artist?.image_url) ? artist.image_url : 'https://via.placeholder.com/200x200?text=No+Image'}
            alt={artist?.name || 'No name'}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.src = 'https://via.placeholder.com/200x200?text=No+Image')}
          />
        </div>
        <h3 className="text-white font-semibold truncate mt-3">{artist?.name || 'Không có tên'}</h3>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Website Nghe Nhạc Trực Tuyến</h1>
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

          {/* Login Popup */}
          {showLoginPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg">
                <p className="mb-4">Vui lòng đăng nhập để thêm bài hát vào danh sách yêu thích.</p>
                <div className="flex justify-end gap-4">
                  <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Đăng nhập
                  </Link>
                  <button onClick={closeLoginPopup} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading and Error States */}
          {loading && <p className="text-center text-gray-400">Đang tải...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {/* Trending Songs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Xu Hướng</h2>
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
                1024: { slidesPerView: 5 },
              }}
            >
              {trendingSongs.map((song) => (
                <SwiperSlide key={song?.id || ''}>{renderSongCard(song)}</SwiperSlide>
              ))}
            </Swiper>
          </section>

          {/* Latest Songs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Mới Nhất</h2>
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
              {latestSongs.map((song) => (
                <SwiperSlide key={song?.id || ''}>{renderSongCard(song)}</SwiperSlide>
              ))}
            </Swiper>
          </section>

          {/* Popular Songs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Phổ Biến</h2>
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
                1024: { slidesPerView: 3 },
              }}
            >
              {popularSongs.map((song) => (
                <SwiperSlide key={song?.id || ''}>{renderSongCard(song)}</SwiperSlide>
              ))}
            </Swiper>
          </section>

          {/* Artists Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Nghệ Sĩ</h2>
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
              {artists.map((artist) => (
                <SwiperSlide key={artist?.id || ''}>{renderArtistCard(artist)}</SwiperSlide>
              ))}
            </Swiper>
          </section>

          {/* Recently Played Songs */}
          {isAuthenticated && userId && recentlyPlayed.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Nghe Gần Đây</h2>
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
                {recentlyPlayed.map((song) => (
                  <SwiperSlide key={song?.id || ''}>{renderSongCard(song)}</SwiperSlide>
                ))}
              </Swiper>
            </section>
          )}
        </div>

        {/* Audio Player at Footer */}
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
                <p className="text-gray-400 text-sm">{currentSong.artist_name}</p>
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
                onClick={() => setIsPlaying(!isPlaying)}
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
>>>>>>> 14f427b2 (second commit)
  );
};

export default HomePage;