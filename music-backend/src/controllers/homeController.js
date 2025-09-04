import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../redux/authSlice';

const DEFAULT_AVATAR = 'https://via.placeholder.com/50x50?text=Avatar';

const useHomeController = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, user, userId, token } = useSelector((state) => state.auth);
    const [latestSongs, setLatestSongs] = useState([]);
    const [popularSongs, setPopularSongs] = useState([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const [trendingSongs, setTrendingSongs] = useState([]);
    const [artists, setArtists] = useState([]);
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
    const [favorites, setFavorites] = useState([]);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const audioRef = useRef(null);
    const navigate = useNavigate();

    // Format time from seconds to mm:ss
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    // Fetch data for all sections and user info
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const requests = [
                    axios.get('http://localhost:6969/api/latest-songs?limit=8'),
                    axios.get('http://localhost:6969/api/popular-songs?limit=6'),
                    axios.get('http://localhost:6969/api/trending-songs?limit=10'),
                    isAuthenticated && userId ? axios.get(`http://localhost:6969/api/recently-played?user_id=${userId}&limit=8`) : Promise.resolve({ data: [] }),
                    axios.get('http://localhost:6969/api/top-artists?limit=8'),
                    isAuthenticated && userId ? axios.get(`http://localhost:6969/api/favorites?user_id=${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }) : Promise.resolve({ data: [] }),
                ];

                if (isAuthenticated && token) {
                    requests.push(axios.get(`http://localhost:6969/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }));
                }

                const [latest, popular, trending, recent, artists, favoritesResponse, userInfo] = await Promise.all(requests);

                setLatestSongs(latest.data || []);
                setPopularSongs(popular.data || []);
                setTrendingSongs(trending.data || []);
                setRecentlyPlayed(recent.data || []);
                setArtists(artists.data || []);
                setFavorites(favoritesResponse.data ? favoritesResponse.data.map(fav => fav.song_id) : []);
                if (userInfo) {
                    setFullName(`${userInfo.data.firstName || ''} ${userInfo.data.lastName || ''}`.trim() || 'Người dùng');
                    setAvatarUrl(userInfo.data.avatar || DEFAULT_AVATAR);
                }
                setLoading(false);
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc thử lại sau.');
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, userId, token]);

    // Handle favorite toggle
    const handleFavoriteToggle = async (song, e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            setShowLoginPopup(true);
            return;
        }

        try {
            if (favorites.includes(song.id)) {
                await axios.delete(`http://localhost:6969/api/favorites`, {
                    data: { user_id: userId, song_id: song.id },
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFavorites(favorites.filter(id => id !== song.id));
                console.log(`Removed favorite: ${song.id}`);
            } else {
                await axios.post(`http://localhost:6969/api/favorites`, {
                    user_id: userId,
                    song_id: song.id,
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFavorites([...favorites, song.id]);
                console.log(`Added favorite: ${song.id}`);
            }
        } catch (err) {
            console.error('Favorite toggle error:', err);
            setError('Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.');
        }
    };

    // Close menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    // Handle audio playback and progress
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);
            const handleTimeUpdate = () => {
                if (audio.duration) {
                    setProgress((audio.currentTime / audio.duration) * 100);
                }
            };
            const handleEnded = () => {
                setIsPlaying(false);
                setProgress(0);
            };

            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);
            audio.addEventListener('timeupdate', handleTimeUpdate);
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
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                audio.removeEventListener('ended', handleEnded);
            };
        }
    }, [isPlaying, currentSong]);

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

    const handleCardClick = (songId) => {
        navigate(`/song/${songId}`);
    };

    const handleArtistClick = (artistId) => {
        navigate(`/artist/${artistId}`);
    };

    const handleProgressChange = (e) => {
        if (audioRef.current && audioRef.current.duration) {
            const newTime = (e.target.value / 100) * audioRef.current.duration;
            audioRef.current.currentTime = newTime;
            setProgress(e.target.value);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        setMenuOpen(false);
        navigate('/');
    };

    const closeLoginPopup = () => {
        setShowLoginPopup(false);
    };

    return {
        isAuthenticated,
        userId,
        token,
        latestSongs,
        popularSongs,
        recentlyPlayed,
        trendingSongs,
        artists,
        fullName,
        avatarUrl,
        favorites,
        showLoginPopup,
        loading,
        error,
        currentSong,
        isPlaying,
        progress,
        menuOpen,
        menuRef,
        audioRef,
        formatTime,
        isValidImageUrl,
        handleFavoriteToggle,
        handlePlayPause,
        handleCardClick,
        handleArtistClick,
        handleProgressChange,
        handleLogout,
        closeLoginPopup,
        setMenuOpen,
    };
};

export default useHomeController;