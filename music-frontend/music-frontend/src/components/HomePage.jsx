import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Pause, Heart, Crown } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { setCurrentSong, setIsPlaying, setCurrentSongList, setCurrentSongIndex } from '../redux/playerSlice';
import Header from './Header';

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

const HomePage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, userId, token } = useSelector((state) => state.auth);
  const { currentSong, isPlaying } = useSelector((state) => state.player);
  const [latestSongs, setLatestSongs] = useState([]);
  const [popularSongs, setPopularSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
          isAuthenticated && token ? axios.get(`http://localhost:6969/api/favorites`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ data: [] }),
        ];
        const [latest, popular, trending, recent, artist, favoritesResponse] = await Promise.all(requests);
        setLatestSongs(latest.data || []);
        setPopularSongs(popular.data || []);
        setTrendingSongs(trending.data || []);
        setRecentlyPlayed(recent.data || []);
        setArtists(artist.data || []);
        setFavorites(favoritesResponse.data.map(fav => fav.song_id) || []);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải dữ liệu.');
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, userId, token]);

  const isValidImageUrl = (url) => {
    return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
  };

  const handlePlayPause = (song, songList = []) => {
    if (!song?.audio_url) {
      setError('Không tìm thấy URL âm thanh.');
      return;
    }
    if (currentSong?.id === song.id) {
      dispatch(setIsPlaying(!isPlaying));
    } else {
      dispatch(setCurrentSong(song));
      dispatch(setCurrentSongList(songList));
      dispatch(setCurrentSongIndex(songList.findIndex(s => s.id === song.id)));
      dispatch(setIsPlaying(true));
    }
  };

  const handleFavoriteToggle = async (song, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      e.preventDefault();
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
        await axios.post(`http://localhost:6969/api/favorites`, { song_id: song.id }, { headers: { Authorization: `Bearer ${token}` } });
        setFavorites([...favorites, song.id]);
      }
    } catch (err) {
      setError('Không thể cập nhật danh sách yêu thích.');
    }
  };

  const renderSongCard = (song) => (
    <div className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200 w-48 cursor-pointer"
      onClick={() => navigate(`/song/${song?.id || ''}`)}>
      <div className="relative">
        {song?.image_url && (
          <img src={isValidImageUrl(song.image_url) ? song.image_url : 'https://via.placeholder.com/200x200?text=No+Image'}
            alt={song?.title || 'No title'}
            className="w-full h-40 object-cover"
            onError={(e) => (e.target.src = 'https://via.placeholder.com/200x200?text=No+Image')} />
        )}
        {song?.exclusive && (
          <Crown className="absolute top-1 left-1 w-5 h-5 text-yellow-500" />
        )}
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold truncate">
          {song?.title || 'Không có tiêu đề'}
        </h3>
        <p className="text-gray-400 text-sm">{song?.artist_name || 'Không có nghệ sĩ'}</p>
      </div>
      <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-green-500 text-white rounded-full p-3 hover:bg-green-600"
        onClick={(e) => {
          e.stopPropagation();
          let songList = trendingSongs.some(s => s.id === song.id) ? trendingSongs :
            latestSongs.some(s => s.id === song.id) ? latestSongs :
              popularSongs.some(s => s.id === song.id) ? popularSongs :
                recentlyPlayed.some(s => s.id === song.id) ? recentlyPlayed : [];
          handlePlayPause(song, songList);
        }}>
        {currentSong?.id === song.id && isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
      </button>
      <button className="absolute top-2 right-2 z-10 p-2 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity duration-200"
        onClick={(e) => handleFavoriteToggle(song, e)}>
        <Heart className={`w-5 h-5 ${favorites.includes(song.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} />
      </button>
    </div>
  );

  const renderArtistCard = (artist) => (
    <div className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200 w-48 text-center"
      onClick={() => navigate(`/artist/${artist?.id || ''}`)}>
      <div className="p-4">
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden">
          <img src={isValidImageUrl(artist?.image_url) ? artist.image_url : 'https://via.placeholder.com/200x200?text=No+Image'}
            alt={artist?.name || 'No name'}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.src = 'https://via.placeholder.com/200x200?text=No+Image')} />
        </div>
        <h3 className="text-white font-semibold truncate mt-3">{artist?.name || 'Không có tên'}</h3>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20 pb-24">
          {showLoginPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg">
                <p className="mb-4">Vui lòng đăng nhập để thêm bài hát vào danh sách yêu thích.</p>
                <div className="flex justify-end gap-4">
                  <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Đăng nhập</Link>
                  <button onClick={() => setShowLoginPopup(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Hủy</button>
                </div>
              </div>
            </div>
          )}
          {loading && <p className="text-center text-gray-400">Đang tải...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {isAuthenticated && userId && recentlyPlayed.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Nghe Gần Đây</h2>
              <Swiper modules={[Navigation, Pagination, Mousewheel]} spaceBetween={16} slidesPerView={1}
                navigation pagination={{ clickable: true }} mousewheel={{ forceToAxis: true }}
                breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}>
                {recentlyPlayed.map((song) => (
                  <SwiperSlide key={song?.id || ''}>{renderSongCard(song)}</SwiperSlide>
                ))}
              </Swiper>
            </section>
          )}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Xu Hướng</h2>
            <Swiper modules={[Navigation, Pagination, Mousewheel]} spaceBetween={16} slidesPerView={1}
              navigation pagination={{ clickable: true }} mousewheel={{ forceToAxis: true }}
              breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 5 } }}>
              {trendingSongs.map((song) => (
                <SwiperSlide key={song?.id || ''}>{renderSongCard(song)}</SwiperSlide>
              ))}
            </Swiper>
          </section>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Mới Nhất</h2>
            <Swiper modules={[Navigation, Pagination, Mousewheel]} spaceBetween={16} slidesPerView={1}
              navigation pagination={{ clickable: true }} mousewheel={{ forceToAxis: true }}
              breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}>
              {latestSongs.map((song) => (
                <SwiperSlide key={song?.id || ''}>{renderSongCard(song)}</SwiperSlide>
              ))}
            </Swiper>
          </section>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Phổ Biến</h2>
            <Swiper modules={[Navigation, Pagination, Mousewheel]} spaceBetween={16} slidesPerView={1}
              navigation pagination={{ clickable: true }} mousewheel={{ forceToAxis: true }}
              breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 3 } }}>
              {popularSongs.map((song) => (
                <SwiperSlide key={song?.id || ''}>{renderSongCard(song)}</SwiperSlide>
              ))}
            </Swiper>
          </section>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Nghệ Sĩ</h2>
            <Swiper modules={[Navigation, Pagination, Mousewheel]} spaceBetween={16} slidesPerView={1}
              navigation pagination={{ clickable: true }} mousewheel={{ forceToAxis: true }}
              breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}>
              {artists.map((artist) => (
                <SwiperSlide key={artist?.id || ''}>{renderArtistCard(artist)}</SwiperSlide>
              ))}
            </Swiper>
          </section>

        </div>
      </div>
    </ErrorBoundary>
  );
};

export default HomePage;