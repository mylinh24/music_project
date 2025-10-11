import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Header from './Header';
import BigSongCard from './BigSongCard';

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
  const [latestSongs, setLatestSongs] = useState([]);
  const [popularSongs, setPopularSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchArtist, setSearchArtist] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Artist search states
  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [artistSearchResults, setArtistSearchResults] = useState([]);
  const [artistSearchLoading, setArtistSearchLoading] = useState(false);
  const [showArtistSearchResults, setShowArtistSearchResults] = useState(false);

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

        console.log("Raw trending data from API:", trending.data);

        // Đảm bảo trường exclusive được xử lý đúng, ép kiểu boolean
        const trendingWithExclusive = trending.data.map(song => ({
          ...song,
          exclusive: Boolean(song.exclusive),
        }));

        setLatestSongs(latest.data || []);
        setPopularSongs(popular.data || []);
        setTrendingSongs(trendingWithExclusive || []);
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

  useEffect(() => {
    console.log("TrendingSongs frontend:", trendingSongs);
  }, [trendingSongs]);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() && !searchArtist.trim()) {
      setError('Vui lòng nhập tên bài hát hoặc tên ca sĩ để tìm kiếm.');
      return;
    }
    try {
      setSearchLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (searchArtist.trim()) params.append('artist', searchArtist.trim());
      const response = await axios.get(`http://localhost:6969/api/songs/search?${params.toString()}`);
      const resultsWithExclusive = response.data.map(song => ({
        ...song,
        exclusive: Boolean(song.exclusive),
      }));
      setSearchResults(resultsWithExclusive);
      setShowSearchResults(true);
      setSearchLoading(false);
    } catch (err) {
      setError('Không thể tìm kiếm bài hát.');
      setSearchLoading(false);
    }
  };

  const handleArtistSearch = async (e) => {
    e.preventDefault();
    if (!artistSearchQuery.trim()) {
      setError('Vui lòng nhập tên nghệ sĩ để tìm kiếm.');
      return;
    }
    try {
      setArtistSearchLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('q', artistSearchQuery.trim());
      const response = await axios.get(`http://localhost:6969/api/artists/search?${params.toString()}`);
      setArtistSearchResults(response.data || []);
      setShowArtistSearchResults(true);
      setArtistSearchLoading(false);
    } catch (err) {
      setError('Không thể tìm kiếm nghệ sĩ.');
      setArtistSearchLoading(false);
    }
  };

  const renderArtistCard = (artist) => (
    <div className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200 w-48 text-center"
      onClick={() => navigate(`/artist/${artist?.id || ''}`)}>
      <div className="p-4">
        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden">
          <img
            src={artist?.image_url && !artist.image_url.startsWith('C:') && artist.image_url.match(/\.(jpeg|jpg|png|gif)$/i)
              ? artist.image_url
              : 'https://via.placeholder.com/200x200?text=No+Image'}
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

          {/* Search Form */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Tìm Kiếm Bài Hát</h2>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Tên bài hát..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Tên ca sĩ..."
                value={searchArtist}
                onChange={(e) => setSearchArtist(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {searchLoading ? 'Đang tìm...' : 'Tìm Kiếm'}
              </button>
            </form>
          </section>

          {/* Artist Search Form */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Tìm Kiếm Nghệ Sĩ</h2>
            <form onSubmit={handleArtistSearch} className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Tên nghệ sĩ..."
                value={artistSearchQuery}
                onChange={(e) => setArtistSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={artistSearchLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {artistSearchLoading ? 'Đang tìm...' : 'Tìm Kiếm'}
              </button>
            </form>
          </section>

          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Kết Quả Tìm Kiếm Bài Hát</h2>
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
                }}>
                {searchResults.map((song) => (
                  <SwiperSlide key={song?.id || ''}>
                    <BigSongCard
                      song={song}
                      songList={searchResults}
                      favorites={favorites}
                      handleFavoriteToggle={handleFavoriteToggle}
                      setError={setError}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </section>
          )}

          {/* Artist Search Results */}
          {showArtistSearchResults && artistSearchResults.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Kết Quả Tìm Kiếm Nghệ Sĩ</h2>
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
                }}>
                {artistSearchResults.map((artist) => (
                  <SwiperSlide key={artist?.id || ''}>{renderArtistCard(artist)}</SwiperSlide>
                ))}
              </Swiper>
            </section>
          )}

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
                }}>
                {recentlyPlayed.map((song) => (
                  <SwiperSlide key={song?.id || ''}>
                    <BigSongCard
                      song={song}
                      songList={recentlyPlayed}
                      favorites={favorites}
                      handleFavoriteToggle={handleFavoriteToggle}
                      setError={setError}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </section>
          )}
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
              }}>
              {trendingSongs.map((song) => (
                <SwiperSlide key={song?.id || ''}>
                  <BigSongCard
                    song={song}
                    songList={trendingSongs}
                    favorites={favorites}
                    handleFavoriteToggle={handleFavoriteToggle}
                    setError={setError}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
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
              }}>
              {latestSongs.map((song) => (
                <SwiperSlide key={song?.id || ''}>
                  <BigSongCard
                    song={song}
                    songList={latestSongs}
                    favorites={favorites}
                    handleFavoriteToggle={handleFavoriteToggle}
                    setError={setError}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
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
              }}>
              {popularSongs.map((song) => (
                <SwiperSlide key={song?.id || ''}>
                  <BigSongCard
                    song={song}
                    songList={popularSongs}
                    favorites={favorites}
                    handleFavoriteToggle={handleFavoriteToggle}
                    setError={setError}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
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
              }}>
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