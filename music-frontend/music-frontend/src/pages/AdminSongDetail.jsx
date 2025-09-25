import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, Pause } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentSong, setIsPlaying, setCurrentSongList, setCurrentSongIndex } from '../redux/playerSlice';

const AdminSongDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { currentSong, isPlaying } = useSelector((state) => state.player);
  const [songData, setSongData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`http://localhost:6969/api/song/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSongData(response.data);
        const validSongs = response.data.artist_songs?.filter(song => song && song.id && song.audio_url) || [];
        dispatch(setCurrentSongList(validSongs));
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch song detail:', err);
        setError('Không thể tải chi tiết bài hát. Vui lòng thử lại.');
        setLoading(false);
      }
    };
    if (id && token) {
      fetchSongDetail();
    }
  }, [id, token, dispatch]);

  const handlePlayPause = () => {
    if (!songData?.audio_url) {
      setError('Không tìm thấy URL âm thanh.');
      return;
    }
    if (currentSong?.id === songData.id) {
      dispatch(setIsPlaying(!isPlaying));
    } else {
      dispatch(setCurrentSong(songData));
      dispatch(setCurrentSongList(songData.artist_songs || []));
      dispatch(setCurrentSongIndex(songData.artist_songs?.findIndex(s => s.id === songData.id) || 0));
      dispatch(setIsPlaying(true));
    }
  };

  const handleSongPlay = (song) => {
    if (currentSong?.id === song.id) {
      dispatch(setIsPlaying(!isPlaying));
    } else {
      dispatch(setCurrentSong(song));
      dispatch(setCurrentSongList(songData.artist_songs || []));
      dispatch(setCurrentSongIndex(songData.artist_songs?.findIndex(s => s.id === song.id) || 0));
      dispatch(setIsPlaying(true));
    }
  };

  const isValidImageUrl = (url) => {
    return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
  };

  if (loading) return <p className="text-center text-gray-400">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <button
          onClick={() => navigate('/admin/songs')}
          className="mb-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
        >
          ← Quay lại danh sách bài hát
        </button>
        {songData && (
          <>
            <div className="mb-8 text-center">
              <div className="relative inline-block">
                <img
                  src={isValidImageUrl(songData.image_url) ? songData.image_url : 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={songData.title}
                  className="w-64 h-64 object-cover rounded-lg mx-auto mb-4"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/300x300?text=No+Image')}
                />
              </div>
              <h1 className="text-4xl font-bold">{songData.title}</h1>
              <p className="text-xl text-gray-400">{songData.artist.name}</p>
              <p className="text-gray-500">Lượt nghe: {songData.listen_count}</p>
              <p className="text-gray-500">Thể loại: {songData.category_name}</p>
              <button
                className="mt-4 bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 flex items-center mx-auto"
                onClick={handlePlayPause}
              >
                {currentSong?.id === songData.id && isPlaying ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                {currentSong?.id === songData.id && isPlaying ? 'Tạm dừng' : 'Phát'}
              </button>
            </div>
            {songData.lyrics && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Lời bài hát</h2>
                <div className="bg-gray-800 p-6 rounded-lg whitespace-pre-line">
                  {songData.lyrics}
                </div>
              </div>
            )}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Bài hát khác của {songData.artist.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {songData.artist_songs?.map((song) => (
                  <div key={song.id} className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => handleSongPlay(song)}>
                    <img
                      src={isValidImageUrl(song.image_url) ? song.image_url : 'https://via.placeholder.com/150x150?text=No+Image'}
                      alt={song.title}
                      className="w-full h-32 object-cover rounded mb-2"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/150x150?text=No+Image')}
                    />
                    <h3 className="font-semibold">{song.title}</h3>
                    <p className="text-gray-400 text-sm">{song.artist?.name}</p>
                    <p className="text-gray-500 text-sm">Lượt nghe: {song.listen_count}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSongDetail;
