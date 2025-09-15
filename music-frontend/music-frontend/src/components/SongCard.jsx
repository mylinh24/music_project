import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Crown } from 'lucide-react';
import { setCurrentSong, setIsPlaying, setCurrentSongList, setCurrentSongIndex } from '../redux/playerSlice';
import axios from 'axios';

const SongCard = ({ song, songList = [], setFavorites, favorites = [], setError, setShowLoginPopup }) => {
    const dispatch = useDispatch();
    const { isAuthenticated, token } = useSelector((state) => state.auth);
    const { currentSong, isPlaying } = useSelector((state) => state.player);
    const navigate = useNavigate();

    const isValidImageUrl = (url) => {
        return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
    };

    const handlePlayPause = (e) => {
        e.stopPropagation();
        if (!song?.audio_url) {
            setError(
                `Bài hát "${song?.title || 'Không xác định'}" không có URL âm thanh hợp lệ.`
            );
            return;
        }
        if (currentSong?.id === song.id) {
            dispatch(setIsPlaying(!isPlaying));
        } else {
            dispatch(setCurrentSong(song));
            dispatch(setCurrentSongList(songList));
            dispatch(setCurrentSongIndex(songList.findIndex((s) => s.id === song.id)));
            dispatch(setIsPlaying(true));
        }
    };

    const isFavorite = Array.isArray(favorites) && favorites.length > 0
        ? typeof favorites[0] === 'string' || typeof favorites[0] === 'number'
            ? favorites.includes(song.id)
            : favorites.some(fav => fav.id === song.id)
        : false;

    const handleFavoriteToggle = async (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            setShowLoginPopup(true);
            return;
        }
        try {
            if (isFavorite) {
                await axios.delete(`http://localhost:6969/api/favorites`, {
                    data: { song_id: song.id },
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (typeof favorites[0] === 'string' || typeof favorites[0] === 'number') {
                    setFavorites(favorites.filter((id) => id !== song.id));
                } else {
                    setFavorites(favorites.filter((fav) => fav.id !== song.id));
                }
            } else {
                await axios.post(
                    `http://localhost:6969/api/favorites`,
                    { song_id: song.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (typeof favorites[0] === 'string' || typeof favorites[0] === 'number') {
                    setFavorites([...favorites, song.id]);
                } else {
                    setFavorites([...favorites, song]);
                }
            }
        } catch (err) {
            setError('Không thể cập nhật danh sách yêu thích.');
        }
    };

    return (
        <div
            className="group relative flex items-center bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200 cursor-pointer p-3"
            onClick={() => navigate(`/song/${song?.id || ''}`)}
        >
            {/* Ảnh */}
            <div className="relative flex-shrink-0">
                {song?.image_url && (
                    <img
                        src={
                            isValidImageUrl(song.image_url)
                                ? song.image_url
                                : 'https://via.placeholder.com/200x200?text=No+Image'
                        }
                        alt={song?.title || 'No title'}
                        className="w-20 h-20 object-cover rounded-md"
                        onError={(e) =>
                            (e.target.src = 'https://via.placeholder.com/200x200?text=No+Image')
                        }
                    />
                )}
            </div>

            {/* Thông tin */}
            <div className="ml-4 flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate flex items-center">
                    {song?.title || 'Không có tiêu đề'}
                    {song?.exclusive && (
                        <Crown className="w-4 h-4 text-yellow-500 ml-2 flex-shrink-0" />
                    )}
                </h3>
                <p className="text-gray-400 text-sm">
                    {song?.artist_name || 'Không có nghệ sĩ'}
                </p>
            </div>

            {/* Nút Play/Pause */}
            <button
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-green-500 text-white rounded-full p-2 hover:bg-green-600"
                onClick={handlePlayPause}
                disabled={!song?.audio_url}
            >
                {currentSong?.id === song.id && isPlaying ? (
                    <Pause className="w-5 h-5" />
                ) : (
                    <Play className="w-5 h-5" />
                )}
            </button>

            {/* Nút Yêu thích */}
            <button
                className="ml-2 p-2 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity duration-200"
                onClick={handleFavoriteToggle}
            >
                <Heart
                    className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`}
                />
            </button>
        </div>
    );
};

export default SongCard;