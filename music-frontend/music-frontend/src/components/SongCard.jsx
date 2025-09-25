import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Crown, MoreVertical, Download, Share2, Link, Facebook } from 'lucide-react';
import { setCurrentSong, setIsPlaying, setCurrentSongList, setCurrentSongIndex } from '../redux/playerSlice';
import axios from 'axios';

const SongCard = ({ song, songList = [], setFavorites, favorites = [], setError, setShowLoginPopup }) => {
    const dispatch = useDispatch();
    const { isAuthenticated, token, user } = useSelector((state) => state.auth);
    const { currentSong, isPlaying } = useSelector((state) => state.player);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const isValidImageUrl = (url) => {
        return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
    };

    const handlePlayPause = (e) => {
        e.stopPropagation();
        console.log('Song:', song.title, 'exclusive:', song.exclusive, 'isAuthenticated:', isAuthenticated, 'user.vip:', user?.vip);
        if (song.exclusive && !isAuthenticated) {
            alert('Bài hát này dành cho tài khoản VIP. Vui lòng nâng cấp để nghe.');
            return;
        }
        if (song.exclusive && !user?.vip) {
            alert('Bài hát này dành cho tài khoản VIP. Vui lòng nâng cấp để nghe.');
            return;
        }
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

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
                setIsShareMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDownload = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            alert('Chỉ tài khoản VIP mới có thể tải xuống bài hát. Vui lòng đăng ký VIP để sử dụng tính năng này.');
            setIsMenuOpen(false);
            return;
        }
        if (!user?.vip) {
            alert('Chỉ tài khoản VIP mới có thể tải xuống bài hát. Vui lòng đăng ký VIP để sử dụng tính năng này.');
            setIsMenuOpen(false);
            return;
        }
        if (!song?.audio_url) {
            setError('Không có URL âm thanh để tải xuống.');
            return;
        }
        window.open(song.audio_url, '_blank');
        setIsMenuOpen(false);
    };

    const handleCopyLink = (e) => {
        e.stopPropagation();
        const songUrl = `${window.location.origin}/song/${song?.id || ''}`;
        navigator.clipboard.writeText(songUrl)
            .then(() => {
                console.log('Link copied to clipboard!');
            })
            .catch(() => {
                setError('Không thể sao chép liên kết.');
            });
        setIsMenuOpen(false);
        setIsShareMenuOpen(false);
    };

    const handleShareFacebook = (e) => {
        e.stopPropagation();
        const songUrl = `${window.location.origin}/song/${song?.id || ''}`;
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(songUrl)}`;
        window.open(facebookShareUrl, '_blank', 'width=600,height=400');
        setIsMenuOpen(false);
        setIsShareMenuOpen(false);
    };

    return (
        <div
            className="group relative flex items-center bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-200 cursor-pointer p-3"
            onClick={() => {


                navigate(`/song/${song?.id || ''}`);
            }}
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
                        loading="lazy"
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

            {/* Nút MoreVertical */}
            <div className="relative" ref={menuRef}>
                <button
                    className="ml-2 p-2 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity duration-200"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(!isMenuOpen);
                    }}
                >
                    <MoreVertical className="w-5 h-5 text-white" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50 overflow-visible">
                        <button
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                            onClick={handleDownload}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Tải bài hát
                        </button>
                        <div className="relative">
                            <button
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsShareMenuOpen(!isShareMenuOpen);
                                }}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Chia sẻ
                            </button>
                            {isShareMenuOpen && (
                                <div className="absolute right-full top-0 w-48 bg-gray-800 rounded-md shadow-lg z-60 overflow-visible">
                                    <button
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                                        onClick={handleCopyLink}
                                    >
                                        <Link className="w-4 h-4 mr-2" />
                                        Sao chép liên kết
                                    </button>
                                    <button
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                                        onClick={handleShareFacebook}
                                    >
                                        <Facebook className="w-4 h-4 mr-2" />
                                        Chia sẻ lên Facebook
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SongCard;