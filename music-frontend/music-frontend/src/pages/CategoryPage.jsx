import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { setCurrentSongList } from '../redux/playerSlice';
import Header from '../components/Header';
import SongCard from '../components/SongCard';

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

const CategoryPage = () => {
    const { category } = useParams();
    const dispatch = useDispatch();
    const { isAuthenticated, token } = useSelector((state) => state.auth);
    const [songs, setSongs] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [songsResponse, favoritesResponse] = await Promise.all([
                    axios.get(`http://localhost:6969/api/songs/category/${category}`),
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
            } catch (err) {
                setError('Không thể tải danh sách bài hát theo thể loại.');
                setLoading(false);
            }
        };
        fetchData();
    }, [category, isAuthenticated, token, dispatch]);

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-900 text-white">
                <Header />
                <div className="container mx-auto px-4 py-8 pt-20 pb-24">
                    <h1 className="text-3xl font-bold mb-8">Bài hát thể loại: {category}</h1>

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
                        <p className="text-xl text-gray-400">Không có bài hát nào trong thể loại này.</p>
                    ) : (
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
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default CategoryPage;