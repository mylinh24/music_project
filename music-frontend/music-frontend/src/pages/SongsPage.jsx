import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { setCurrentSongList } from '../redux/playerSlice';
import Header from '../components/Header';
import SongCard from '../components/SongCard';
import BigSongCard from '../components/BigSongCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

const SongsPage = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, token, user } = useSelector((state) => state.auth);
    const [songs, setSongs] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchArtist, setSearchArtist] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [songsResponse, favoritesResponse] = await Promise.all([
                    axios.get(`http://localhost:6969/api/songs?page=1&limit=5`, isAuthenticated && token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
                    isAuthenticated && token
                        ? axios.get(`http://localhost:6969/api/favorites`, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                        : Promise.resolve({ data: [] }),
                ]);
                const validSongs = songsResponse.data.filter(
                    (song) => song && song.id && song.audio_url
                );
                setSongs(validSongs);
                setFavorites(favoritesResponse.data.map((fav) => fav.song_id) || []);
                dispatch(setCurrentSongList(validSongs));
                setLoading(false);
                setHasMore(validSongs.length === 5);
            } catch (err) {
                setError('Không thể tải danh sách bài hát.');
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated, token, dispatch]);

    const fetchMoreSongs = async () => {
        try {
            const nextPage = page + 1;
            const response = await axios.get(`http://localhost:6969/api/songs?page=${nextPage}&limit=5`, isAuthenticated && token ? { headers: { Authorization: `Bearer ${token}` } } : {});
        const newSongs = response.data.filter(
            (song) => song && song.id && song.audio_url
        );
        setSongs(prevSongs => [...prevSongs, ...newSongs]);
        setPage(nextPage);
        setHasMore(newSongs.length === 5);
        dispatch(setCurrentSongList([...songs, ...newSongs]));
        } catch (err) {
            setError('Không thể tải thêm bài hát.');
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

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-900 text-white">
                <Header />
                <div className="container mx-auto px-4 py-8 pt-20 pb-24">
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
                                            handleFavoriteToggle={(song, e) => {
                                                e.stopPropagation();
                                                if (!isAuthenticated) {
                                                    e.preventDefault();
                                                    setShowLoginPopup(true);
                                                    return;
                                                }
                                                // Handle favorite toggle logic here
                                                if (favorites.includes(song.id)) {
                                                    axios.delete(`http://localhost:6969/api/favorites`, {
                                                        data: { song_id: song.id },
                                                        headers: { Authorization: `Bearer ${token}` },
                                                    }).then(() => {
                                                        setFavorites(favorites.filter(id => id !== song.id));
                                                    }).catch(() => {
                                                        setError('Không thể cập nhật danh sách yêu thích.');
                                                    });
                                                } else {
                                                    axios.post(`http://localhost:6969/api/favorites`, { song_id: song.id }, { headers: { Authorization: `Bearer ${token}` } }).then(() => {
                                                        setFavorites([...favorites, song.id]);
                                                    }).catch(() => {
                                                        setError('Không thể cập nhật danh sách yêu thích.');
                                                    });
                                                }
                                            }}
                                            setError={setError}
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </section>
                    )}

                    <h1 className="text-3xl font-bold mb-8">Tất cả bài hát</h1>

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
                        <div className="flex justify-center items-center h-64">
                            <div className="text-xl text-gray-400">Đang tải...</div>
                        </div>
                    )}
                    {error && (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-xl text-red-500">{error}</div>
                        </div>
                    )}

                    {/* Danh sách bài hát */}
                    {songs.length === 0 && !loading && !error ? (
                        <p className="text-xl text-gray-400">Không có bài hát nào.</p>
                    ) : (
                        <InfiniteScroll
                            dataLength={songs.length}
                            next={fetchMoreSongs}
                            hasMore={hasMore}
                            loader={<div className="text-center text-gray-400">Đang tải thêm...</div>}
                            endMessage={<div className="text-center text-gray-400">Đã tải hết bài hát.</div>}
                        >
                            <div className="flex flex-col gap-3">
                                {songs.map((song) => (
                                    <SongCard
                                        key={song.id}
                                        song={song}
                                        songList={songs}
                                        setFavorites={setFavorites}
                                        favorites={favorites}
                                        setError={setError}
                                        setShowLoginPopup={setShowLoginPopup}
                                    />
                                ))}
                            </div>
                        </InfiniteScroll>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default SongsPage;
