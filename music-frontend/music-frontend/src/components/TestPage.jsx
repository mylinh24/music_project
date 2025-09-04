import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [searchQuery, setSearchQuery] = useState('');
    const [songs, setsongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch songs from the backend API
    useEffect(() => {
        const fetchsongs = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/songs'); // Adjust the API URL as needed
                setsongs(response.data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách bài hát. Vui lòng thử lại sau.');
                setLoading(false);
            }
        };

        fetchsongs();
    }, []);

    // Filter songs based on search query
    const filteredsongs = songs.filter(
        (song) =>
            song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.category_name.toLowerCase().includes(searchQuery.toLowerCase())
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

                {/* Search bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm bài hát, ca sĩ, hoặc thể loại..."
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* song list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <p className="text-center text-gray-600 col-span-full">Đang tải...</p>
                    ) : error ? (
                        <p className="text-center text-red-600 col-span-full">{error}</p>
                    ) : filteredsongs.length > 0 ? (
                        filteredsongs.map((song) => (
                            <div
                                key={song.id}
                                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-semibold text-gray-800">{song.title}</h3>
                                <p className="text-gray-600">{song.artist_name}</p>
                                <p className="text-sm text-gray-500">Thể loại: {song.category_name}</p>
                                {song.image_url && (
                                    <img
                                        src={song.image_url}
                                        alt={song.title}
                                        className="w-full h-40 object-cover rounded-md mt-3"
                                    />
                                )}
                                <audio controls className="w-full mt-3">
                                    <source src={song.audio_url} type="audio/mpeg" />
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
    );
};

export default HomePage;