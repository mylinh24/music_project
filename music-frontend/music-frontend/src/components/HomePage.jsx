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
  );
};

export default HomePage;