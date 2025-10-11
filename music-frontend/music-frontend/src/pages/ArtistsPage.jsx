// music-frontend/src/pages/ArtistsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import Header from '../components/Header';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ArtistsPage = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [displayedArtists, setDisplayedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const artistsPerPage = 4; // Số nghệ sĩ hiển thị mỗi lần

  // Artist search states
  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [artistSearchResults, setArtistSearchResults] = useState([]);
  const [artistSearchLoading, setArtistSearchLoading] = useState(false);
  const [showArtistSearchResults, setShowArtistSearchResults] = useState(false);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:6969/api/artists');
        const validArtists = response.data.filter(
          (artist) => artist && artist.id && artist.name
        );
        setArtists(validArtists);
        // Hiển thị trang đầu tiên
        setDisplayedArtists(validArtists.slice(0, artistsPerPage));
        setHasMore(validArtists.length > artistsPerPage);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách nghệ sĩ.');
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const fetchMoreArtists = () => {
    try {
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * artistsPerPage;
      const endIndex = startIndex + artistsPerPage;
      const newArtists = artists.slice(startIndex, endIndex);

      setDisplayedArtists((prevArtists) => [...prevArtists, ...newArtists]);
      setPage(nextPage);
      setHasMore(endIndex < artists.length);
    } catch (err) {
      setError('Không thể tải thêm nghệ sĩ.');
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

  if (loading && displayedArtists.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error && displayedArtists.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
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

        <h1 className="text-3xl font-bold mb-8">Tất cả nghệ sĩ</h1>

        {displayedArtists.length === 0 && !loading && !error ? (
          <p className="text-xl text-gray-400">Không có nghệ sĩ nào.</p>
        ) : (
          <InfiniteScroll
            dataLength={displayedArtists.length}
            next={fetchMoreArtists}
            hasMore={hasMore}
            loader={<div className="text-center text-gray-400">Đang tải thêm...</div>}
            endMessage={<div className="text-center text-gray-400">Đã tải hết nghệ sĩ.</div>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                >
                  <img
                    src={artist.image_url || 'https://via.placeholder.com/200x200?text=No+Image'}
                    alt={artist.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/200x200?text=No+Image')}
                  />
                  <h3 className="text-lg font-semibold mb-2">
                    <Link to={`/artist/${artist.id}`} className="hover:underline">
                      {artist.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-500">{artist.total_listens} lượt nghe</p>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default ArtistsPage;