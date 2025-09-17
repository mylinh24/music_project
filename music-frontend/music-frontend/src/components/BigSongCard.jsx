import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Crown } from 'lucide-react';
import { setCurrentSong, setIsPlaying, setCurrentSongList, setCurrentSongIndex } from '../redux/playerSlice';

const BigSongCard = ({ song, songList = [], favorites = [], handleFavoriteToggle, setError, showListenCount = false, onPlay }) => {
    const dispatch = useDispatch();
    const { currentSong, isPlaying } = useSelector((state) => state.player);
    const navigate = useNavigate();

    const isValidImageUrl = (url) => {
        return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
    };

    const handlePlayPause = (e) => {
        e.stopPropagation();
        if (!song?.audio_url) {
            setError('Không tìm thấy URL âm thanh.');
            return;
        }
        if (onPlay) {
            onPlay(song);
        } else {
            if (currentSong?.id === song.id) {
                dispatch(setIsPlaying(!isPlaying));
            } else {
                dispatch(setCurrentSong(song));
                dispatch(setCurrentSongList(songList));
                dispatch(setCurrentSongIndex(songList.findIndex(s => s.id === song.id)));
                dispatch(setIsPlaying(true));
            }
        }
    };

    return (
        <div
            className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200 w-48 cursor-pointer"
            onClick={() => navigate(`/song/${song?.id || ''}`)}
        >
            <div className="relative">
                {song?.image_url && (
                    <img
                        src={isValidImageUrl(song.image_url) ? song.image_url : 'https://via.placeholder.com/200x200?text=No+Image'}
                        alt={song?.title || 'No title'}
                        className="w-full h-40 object-cover"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/200x200?text=No+Image')}
                    />
                )}
                {song?.exclusive && (
                    <Crown className="absolute top-1 left-1 w-5 h-5 text-yellow-500 drop-shadow-lg z-20" />
                )}
            </div>
            <div className="p-4">
                <h3 className="text-white font-semibold truncate">
                    {song?.title || 'Không có tiêu đề'}
                </h3>
                <p className="text-gray-400 text-sm">{song?.artist_name || 'Không có nghệ sĩ'}</p>
                {showListenCount && (
                    <p className="text-gray-400 text-sm">Lượt nghe: {song?.listen_count || 0}</p>
                )}
            </div>
            <button
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-green-500 text-white rounded-full p-3 hover:bg-green-600"
                onClick={handlePlayPause}
                disabled={!song?.audio_url}
            >
                {currentSong?.id === song.id && isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
                className="absolute top-2 right-2 z-10 p-2 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity duration-200"
                onClick={(e) => handleFavoriteToggle(song, e)}
            >
                <Heart className={`w-5 h-5 ${favorites.includes(song.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} />
            </button>
        </div>
    );
};

export default BigSongCard;