// music-frontend/src/pages/ArtistDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Play, Pause } from "lucide-react";

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

const ArtistDetailPage = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  useEffect(() => {
    const fetchArtistDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:6969/api/artist/${artistId}`);
        setArtistData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch artist detail:', err);
        setError('Không thể tải chi tiết nghệ sĩ. Vui lòng thử lại.');
        setLoading(false);
      }
    };

    if (artistId) {
      fetchArtistDetail();
    }
  }, [artistId]);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => {
        setIsPlaying(false);
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
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
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [isPlaying, currentSong]);

  const handleSongClick = (songId) => {
    navigate(`/song/${songId}`);
  };

  if (loading) return <p className="text-center text-gray-400">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto p-6">
          {artistData && (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold">{artistData.artist.name}</h1>
                <img
                  src={isValidImageUrl(artistData.artist.image_url) ? artistData.artist.image_url : 'https://via.placeholder.com/200x200?text=No+Image'}
                  alt={artistData.artist.name}
                  className="w-48 h-48 rounded-full object-cover mx-auto mt-4"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/200x200?text=No+Image')}
                />
                <p className="mt-2">Tổng lượt nghe: {artistData.artist.total_listens}</p>
              </div>
              <h2 className="text-2xl font-bold mb-4">Danh sách bài hát</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {artistData.songs.map((song) => (
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
                        handlePlayPause(song);
                      }}
                    >
                      <button className="bg-green-500 text-white rounded-full p-3 hover:bg-green-600">
                        {currentSong?.id === song.id && isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <audio ref={audioRef} />
      </div>
    </ErrorBoundary>
  );
};

export default ArtistDetailPage;