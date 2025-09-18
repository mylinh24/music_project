import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Crown, MoreVertical, Download, Share2, Link, Facebook } from 'lucide-react';
import { setCurrentSong, setIsPlaying, setCurrentSongList, setCurrentSongIndex } from '../redux/playerSlice';
import axios from 'axios';

const BigSongCard = ({ song, songList = [], favorites = [], handleFavoriteToggle, setError, showListenCount = false, onPlay }) => {
    const dispatch = useDispatch();
    const { currentSong, isPlaying } = useSelector((state) => state.player);
    const { isAuthenticated, user, token } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const isValidImageUrl = (url) => {
        return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
    };

    const handlePlayPause = (e) => {
        e.stopPropagation();
        if (song.exclusive && !isAuthenticated) {
            alert('Bạn cần đăng nhập để nghe bài hát này.');
            return;
        }
        if (song.exclusive && !user?.vip) {
            alert('Bài hát này dành cho tài khoản VIP. Vui lòng nâng cấp để nghe.');
            return;
        }
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
            alert('Bạn cần đăng nhập để tải xuống bài hát.');
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
            className="group relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-200 w-48 cursor-pointer"
            onClick={() => {
                if (song.exclusive && !isAuthenticated) {
                    alert('Bạn cần đăng nhập để xem chi tiết bài hát này.');
                    return;
                }
                if (song.exclusive && !user?.vip) {
                    alert('Bài hát này dành cho tài khoản VIP. Vui lòng nâng cấp để xem chi tiết.');
                    return;
                }
                navigate(`/song/${song?.id || ''}`);
            }}
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
            {/* Nút MoreVertical */}
            <div className="absolute top-10 right-2 z-10" ref={menuRef}>
                <button
                    className="p-2 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition-opacity duration-200"
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
                                <div className="absolute left-0 top-full mt-1 w-48 bg-gray-800 rounded-md shadow-lg z-60 overflow-visible">
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

export default BigSongCard;