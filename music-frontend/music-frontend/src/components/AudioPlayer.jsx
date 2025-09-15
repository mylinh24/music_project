import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  setCurrentSong,
  setIsPlaying,
  setProgress,
  setVolume,
  setPlaybackRate,
  playNextSong,
  playPrevSong,
  setError,
} from '../redux/playerSlice';

// Hàm debounce để giảm tần suất cập nhật
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const AudioPlayer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentSong, isPlaying, progress, volume, playbackRate, currentSongList, currentSongIndex } = useSelector(
    (state) => state.player
  );
  const { userId, isAuthenticated } = useSelector((state) => state.auth);
  const audioRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);

  // States cho theo dõi lượt nghe
  const [hasCountedListen, setHasCountedListen] = useState(false);
  const [listeningSession, setListeningSession] = useState({
    startPosition: 0,        // Vị trí bắt đầu nghe (seconds)
    accumulatedTime: 0,      // Thời gian nghe tích lũy (seconds)
    lastUpdateTime: null,    // Thời điểm cập nhật cuối cùng
    isActive: false          // Session đang hoạt động hay không
  });

  // Cập nhật isPlayingRef khi isPlaying thay đổi
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Hàm reset session nghe (khi bắt đầu từ vị trí ≤ 50%)
  const resetListeningSession = useCallback((currentTime) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const halfDuration = audio.duration / 2;

    // Chỉ reset nếu vị trí hiện tại ≤ 50% thời lượng bài hát
    if (currentTime <= halfDuration) {
      setListeningSession({
        startPosition: currentTime,
        accumulatedTime: 0,
        lastUpdateTime: Date.now(),
        isActive: true
      });
      console.log(`Reset listening session at ${currentTime.toFixed(2)}s (≤50% at ${halfDuration.toFixed(2)}s)`);
    }
  }, []);

  // Hàm cập nhật thời gian nghe tích lũy
  const updateAccumulatedTime = useCallback(() => {
    const now = Date.now();

    setListeningSession(prev => {
      if (!prev.isActive || !prev.lastUpdateTime || !isPlayingRef.current) {
        return { ...prev, lastUpdateTime: now };
      }

      const timeDelta = (now - prev.lastUpdateTime) / 1000; // Convert to seconds
      const newAccumulatedTime = prev.accumulatedTime + timeDelta;

      return {
        ...prev,
        accumulatedTime: newAccumulatedTime,
        lastUpdateTime: now
      };
    });
  }, []);

  // Theo dõi trạng thái phát/dừng để cập nhật session
  useEffect(() => {
    let intervalId = null;

    if (listeningSession.isActive) {
      // Cập nhật thời gian tích lũy mỗi 100ms khi session active
      intervalId = setInterval(updateAccumulatedTime, 100);

      // Cập nhật lastUpdateTime khi session active
      setListeningSession(prev => ({
        ...prev,
        lastUpdateTime: Date.now()
      }));
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [listeningSession.isActive, updateAccumulatedTime]);

  // Kiểm tra và gửi lượt nghe khi đủ điều kiện
  useEffect(() => {
    const audio = audioRef.current;

    if (
      audio &&
      currentSong &&
      isAuthenticated &&
      !hasCountedListen &&
      audio.duration > 0 &&
      listeningSession.isActive
    ) {
      const requiredTime = audio.duration / 2; // 50% thời lượng bài hát

      if (listeningSession.accumulatedTime >= requiredTime) {
        console.log(`Listen counted! Accumulated: ${listeningSession.accumulatedTime.toFixed(2)}s, Required: ${requiredTime.toFixed(2)}s`);

        // Gọi API ghi lượt nghe
        axios
          .post('http://localhost:6969/api/listen-history', {
            user_id: userId,
            song_id: currentSong.id,
          })
          .then(() => {
            setHasCountedListen(true);
            // Vô hiệu hóa session sau khi đã tính lượt nghe
            setListeningSession(prev => ({ ...prev, isActive: false }));
          })
          .catch((error) => {
            console.error('Error recording listen:', error);
          });
      }
    }
  }, [listeningSession.accumulatedTime, currentSong, isAuthenticated, hasCountedListen, userId]);

  // Hàm cập nhật tiến độ
  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !isNaN(audio.currentTime) && !isNaN(audio.duration)) {
      dispatch(setProgress(audio.currentTime));
    }
  }, [dispatch]);

  // Cập nhật nguồn âm thanh và trạng thái phát
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.audio_url) return;

    // Reset trạng thái lượt nghe khi chuyển bài hát mới
    setListeningSession({
      startPosition: 0,
      accumulatedTime: 0,
      lastUpdateTime: null,
      isActive: false,
      hasCountedListen: false
    });

    // Chỉ cập nhật src nếu khác với nguồn hiện tại
    if (audio.src !== currentSong.audio_url) {
      audio.src = currentSong.audio_url;
      audio.currentTime = 0;
      dispatch(setProgress(0));
    }

    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audio.currentTime = progress;

    const playAudio = async () => {
      if (isPlaying) {
        try {
          await audio.play();
          // Khởi tạo session nghe khi bắt đầu phát
          resetListeningSession(audio.currentTime);
        } catch (err) {
          dispatch(setError('Không thể phát âm thanh.'));
          dispatch(setIsPlaying(false));
        }
      } else {
        audio.pause();
      }
    };

    playAudio();
  }, [currentSong, isPlaying, volume, playbackRate, dispatch, resetListeningSession]);

  // Xử lý sự kiện timeupdate và ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      dispatch(playNextSong());
    };

    // Xử lý sự kiện seeked (khi người dùng tua)
    const handleSeeked = () => {
      const currentTime = audio.currentTime;
      const halfDuration = audio.duration / 2;

      console.log(`Seeked to ${currentTime.toFixed(2)}s (Half duration: ${halfDuration.toFixed(2)}s)`);

      // Nếu tua về vị trí ≤ 50%, reset session
      if (currentTime <= halfDuration) {
        resetListeningSession(currentTime);
      } else {
        // Nếu tua về vị trí > 50%, vô hiệu hóa session hiện tại
        // vì không thể đạt đủ 50% thời gian nghe từ vị trí này
        setListeningSession(prev => ({ ...prev, isActive: false }));
        console.log('Session deactivated - seeked to position > 50%');
      }
    };

    // Gắn sự kiện
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('seeked', handleSeeked);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('seeked', handleSeeked);
    };
  }, [dispatch, updateProgress, resetListeningSession]);

  const handlePlayPause = () => {
    if (!currentSong?.audio_url) {
      dispatch(setError('Không có bài hát được chọn.'));
      return;
    }

    const audio = audioRef.current;

    // Nếu đang chuyển từ pause sang play và chưa có session active
    if (!isPlaying && audio && !listeningSession.isActive) {
      resetListeningSession(audio.currentTime);
    }

    dispatch(setIsPlaying(!isPlaying));
  };

  const handleNext = () => {
    dispatch(playNextSong());
  };

  const handlePrev = () => {
    dispatch(playPrevSong());
  };

  const handleProgressChange = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const newTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = newTime;
    dispatch(setProgress(newTime));
    // Sự kiện seeked sẽ được tự động trigger và xử lý logic reset session
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    dispatch(setVolume(newVolume));
  };

  const handlePlaybackRateChange = (rate) => {
    dispatch(setPlaybackRate(rate));
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSongClick = () => {
    if (currentSong?.id) {
      navigate(`/song/${currentSong.id}`);
    }
  };

  const handleArtistClick = () => {
    const artistId = currentSong?.artist?.id || currentSong?.artist_id;
    if (artistId) {
      navigate(`/artist/${artistId}`);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 text-white p-4 flex items-center justify-between">
      <audio ref={audioRef} />
      <div className="flex items-center gap-4 w-1/3">
        <img
          src={currentSong?.image_url || 'https://via.placeholder.com/50x50?text=No+Image'}
          alt={currentSong?.title || 'No title'}
          className="w-12 h-12 object-cover rounded cursor-pointer"
          onClick={handleSongClick}
          onError={(e) => (e.target.src = 'https://via.placeholder.com/50x50?text=No+Image')}
        />
        <div>
          <p className="font-semibold cursor-pointer hover:underline" onClick={handleSongClick}>
            {currentSong?.title || 'Chưa chọn bài hát'}
          </p>
          <p
            className="text-sm text-gray-400 cursor-pointer hover:underline"
            onClick={handleArtistClick}
          >
            {currentSong?.artist_name || currentSong?.artist?.name || 'Không có nghệ sĩ'}
          </p>
        </div>
        {/* Debug info - có thể xóa trong production */}
        {process.env.NODE_ENV === 'development' && listeningSession.isActive && (
          <div className="text-xs text-yellow-300">
            <div>Acc: {listeningSession.accumulatedTime.toFixed(1)}s</div>
            <div>Playing: {isPlaying ? 'YES' : 'NO'}</div>
            <div>Start: {listeningSession.startPosition.toFixed(1)}s</div>
            <div>Req: {(audioRef.current?.duration ? (audioRef.current.duration / 2).toFixed(1) : 0)}s</div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center w-1/3">
        <div className="flex gap-4 mb-2">
          <button onClick={handlePrev} disabled={!currentSongList?.length || currentSongIndex === 0}>
            <SkipBack className="w-6 h-6" />
          </button>
          <button onClick={handlePlayPause}>
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button
            onClick={handleNext}
            disabled={!currentSongList?.length || currentSongIndex === currentSongList.length - 1}
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center w-full gap-2">
          <span className="text-sm">{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={audioRef.current?.duration ? (progress / audioRef.current.duration) * 100 : 0}
            onChange={handleProgressChange}
            className="w-full"
            disabled={!audioRef.current?.duration}
          />
          <span className="text-sm">{formatTime(audioRef.current?.duration || 0)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 w-1/3 justify-end">
        <div className="flex items-center gap-2">
          {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="w-24"
          />
        </div>
        <select
          value={playbackRate}
          onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
          className="bg-gray-700 text-white rounded p-1"
        >
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
      </div>
    </div>
  );
};

export default AudioPlayer;