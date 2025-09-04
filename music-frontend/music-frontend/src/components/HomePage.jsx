import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, Pause, SkipForward, SkipBack, Heart } from 'lucide-react';
import SwiperCore from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
          <h2 className="text-xl font-bold">Đã xảy ra lỗi</h2>
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

const HomePage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [latestSongs, setLatestSongs] = useState([]);
  const [popularSongs, setPopularSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [favorites, setFavorites] = useState([]); // State for favorites
  const [showLoginPopup, setShowLoginPopup] = useState(false); // State for login popup
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Format time from seconds to mm:ss
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Fetch data for all sections
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch favorites if authenticated
        if (isAuthenticated && user?.id) {
          const favoritesResponse = await axios.get(`http://localhost:6969/api/favorites?user_id=${user.id}`);
          if (favoritesResponse.data && Array.isArray(favoritesResponse.data)) {
            setFavorites(favoritesResponse.data.map(fav => fav.song_id));
            console.log('Favorites:', favoritesResponse.data); // Debug
          } else {
            setFavorites([]);
          }
        }

        // Latest Songs: 8 bài mới nhất theo release_date
        const latestResponse = await axios.get('http://localhost:6969/api/songs?sort=release_date&limit=8');
        if (latestResponse.data && Array.isArray(latestResponse.data)) {
          setLatestSongs(latestResponse.data);
          console.log('Latest songs:', latestResponse.data); // Debug
        } else {
          setLatestSongs([]);
        }

        // Popular Songs: 6 bài nghe nhiều nhất theo listen_count
        const popularResponse = await axios.get('http://localhost:6969/api/songs?sort=listen_count&limit=6');
        if (popularResponse.data && Array.isArray(popularResponse.data)) {
          setPopularSongs(popularResponse.data);
        } else {
          setPopularSongs([]);
        }

        // Trending Songs: 10 bài xu hướng trong 7 ngày
        const sevenDaysAgo = new Date('2025-09-02T18:06:00+07:00');
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const trendingResponse = await axios.get(`http://localhost:6969/api/trending-songs?start_date=${sevenDaysAgo.toISOString()}&limit=10`);
        if (trendingResponse.data && Array.isArray(trendingResponse.data)) {
          setTrendingSongs(trendingResponse.data);
        } else {
          setTrendingSongs([]);
        }

        // Recently Played: 8 bài nghe gần đây theo listened_at
        if (isAuthenticated && user?.id) {
          const recentResponse = await axios.get(`http://localhost:6969/api/listen-history?user_id=${user.id}&sort=listened_at&limit=8`);
          if (recentResponse.data && Array.isArray(recentResponse.data)) {
            setRecentlyPlayed(recentResponse.data);
          } else {
            setRecentlyPlayed([]);
          }
        } else {
          setRecentlyPlayed([]);
        }

        // Artists: Fetch top 8 artists
        const artistsResponse = await axios.get('http://localhost:6969/api/artists?limit=8');
        if (artistsResponse.data && Array.isArray(artistsResponse.data)) {
          setArtists(artistsResponse.data);
        } else {
          setArtists([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc thử lại sau.');
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user?.id]);

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
          data: { user_id: user.id, song_id: song.id },
        });
        setFavorites(favorites.filter(id => id !== song.id));
        console.log(`Removed favorite: ${song.id}`); // Debug
      } else {
        await axios.post(`http://localhost:6969/api/favorites`, {
          user_id: user.id,
          song_id: song.id,
        });
        setFavorites([...favorites, song.id]);
        console.log(`Added favorite: ${song.id}`); // Debug
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
      setError('Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.');
    }
  };

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

  const handleCardClick = (songId) => {
    navigate(`/song/${songId}`);
  };

  const handleArtistClick = (artistId) => {
    navigate(`/artist/${artistId}`);
  };

  const handleProgressChange = (e) => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(e.target.value);
    }
  };

  const closeLoginPopup = () => {
    setShowLoginPopup(false);
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
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link to="/profile" className="text-green-500 hover:underline font-semibold">
                  Tài khoản
                </Link>
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
          {isAuthenticated && recentlyPlayed.length > 0 && (
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
    </ErrorBoundary>
  );
};

export default HomePage;