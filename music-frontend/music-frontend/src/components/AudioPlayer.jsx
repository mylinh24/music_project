import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  setCurrentSong,
  setCurrentSongIndex,
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
  const { userId, isAuthenticated, user } = useSelector((state) => state.auth);
  const audioRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);

  // States cho theo dõi lượt nghe
  const [listeningSession, setListeningSession] = useState({
    startPosition: 0,        // Vị trí bắt đầu nghe (seconds)
    accumulatedTime: 0,      // Thời gian nghe tích lũy (seconds)
    lastUpdateTime: null,    // Thời điểm cập nhật cuối cùng
    sessionStartTime: null,  // Thời điểm bắt đầu session
    isActive: false          // Session đang hoạt động hay không
  });

  // Cập nhật isPlayingRef khi isPlaying thay đổi
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Hàm reset session nghe (khi bắt đầu từ vị trí ≤ 49%)
  const resetListeningSession = useCallback((currentTime) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const lowerBound = audio.duration * 0.49; // 49%
    const upperBound = audio.duration * 0.49; // 

    // Reset session nếu vị trí hiện tại ≤ 49%
    if (currentTime <= lowerBound) {
      setListeningSession({
        startPosition: currentTime,
        accumulatedTime: 0,
        lastUpdateTime: Date.now(),
        sessionStartTime: Date.now(),
        isActive: true
      });
      console.log(`Reset listening session at ${currentTime.toFixed(2)}s (≤49% at ${lowerBound.toFixed(2)}s)`);
    }
    // Deactivate session if seeked to > 49%
    else if (currentTime > upperBound) {
      setListeningSession(prev => ({ ...prev, isActive: false }));
      console.log(`Session deactivated - seeked to position > 49% (${currentTime.toFixed(2)}s)`);
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
      audio.duration > 0 &&
      listeningSession.isActive
    ) {
      const requiredTime = audio.duration * 0.51; // 51% thời lượng bài hát

      if (listeningSession.accumulatedTime >= requiredTime) {
        console.log(`Listen counted! Accumulated: ${listeningSession.accumulatedTime.toFixed(2)}s, Required: ${requiredTime.toFixed(2)}s`);

        // Gọi API ghi lượt nghe
        const requestBody = { song_id: currentSong.id };
        if (isAuthenticated && userId) {
          requestBody.user_id = userId;
        }

        axios
          .post('http://localhost:6969/api/listen-history', requestBody)
          .then(() => {
            // Reset accumulatedTime to allow counting again
            setListeningSession(prev => ({ ...prev, accumulatedTime: 0 }));
          })
          .catch((error) => {
            console.error('Error recording listen:', error);
          });
      }
    }
  }, [listeningSession.accumulatedTime, currentSong, isAuthenticated, userId]);

  // Hàm cập nhật tiến độ
  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !isNaN(audio.currentTime) && !isNaN(audio.duration)) {
      dispatch(setProgress(audio.currentTime));
    }
  }, [dispatch]);

  // Cập nhật nguồn âm thanh khi chuyển bài hát
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.audio_url) return;

    // Reset trạng thái lượt nghe khi chuyển bài hát mới
    setListeningSession({
      startPosition: 0,
      accumulatedTime: 0,
      lastUpdateTime: null,
      sessionStartTime: null,
      isActive: false
    });

    // Chỉ cập nhật src nếu khác với nguồn hiện tại
    if (audio.src !== currentSong.audio_url) {
      audio.src = currentSong.audio_url;
      audio.currentTime = 0;
      dispatch(setProgress(0));
    }

    audio.currentTime = progress;

    // THAY ĐỔI: Gọi resetListeningSession ngay khi chuyển bài mới để set isActive: true và đảm bảo session active cho autoplay
    resetListeningSession(0);
  }, [currentSong, dispatch, resetListeningSession]);

  // Cập nhật volume và playbackRate riêng biệt, không reset session
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.playbackRate = playbackRate;
  }, [volume, playbackRate]);

  // Xử lý phát/dừng
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().then(() => {
        if (!listeningSession.isActive) {
          resetListeningSession(audio.currentTime);
        }
      }).catch(err => {
        dispatch(setError('Không thể phát âm thanh.'));
        dispatch(setIsPlaying(false));
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, dispatch, resetListeningSession, listeningSession.isActive, currentSong]);

  // Xử lý sự kiện timeupdate và ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // Skip exclusive songs if user is not VIP
      if (!user?.vip) {
        let nextIndex = currentSongIndex + 1;
        while (nextIndex < currentSongList.length && currentSongList[nextIndex].exclusive) {
          nextIndex++;
        }
        if (nextIndex < currentSongList.length) {
          dispatch(setCurrentSongIndex(nextIndex));
          dispatch(setCurrentSong(currentSongList[nextIndex]));
          dispatch(setIsPlaying(true));
        } else {
          dispatch(setIsPlaying(false));
        }
      } else {
        dispatch(playNextSong());
      }
    };

    // Xử lý sự kiện seeked (khi người dùng tua)
    const handleSeeked = () => {
      const currentTime = audio.currentTime;
      const halfDuration = audio.duration * 0.51; // 51%

      console.log(`Seeked to ${currentTime.toFixed(2)}s (Half duration: ${halfDuration.toFixed(2)}s)`);

      // Nếu tua về vị trí ≤ 49%, reset session
      if (currentTime <= audio.duration * 0.49) {
        resetListeningSession(currentTime);
      } else {
        // Nếu tua về vị trí > 51%, vô hiệu hóa session hiện tại
        setListeningSession(prev => ({ ...prev, isActive: false }));
        console.log('Session deactivated - seeked to position > 51%');
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
  }, [dispatch, updateProgress, resetListeningSession, user, currentSongIndex, currentSongList]);

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
    // Allow clicking next always, but skip exclusive songs for non-VIP users
    if (!user?.vip) {
      let nextIndex = currentSongIndex + 1;
      while (nextIndex < currentSongList.length && currentSongList[nextIndex].exclusive) {
        nextIndex++;
      }
      if (nextIndex < currentSongList.length) {
        dispatch(setCurrentSongIndex(nextIndex));
        dispatch(setCurrentSong(currentSongList[nextIndex]));
        dispatch(setIsPlaying(true));
      } else {
        // If no non-exclusive next song, just stop playing but allow button click
        dispatch(setIsPlaying(false));
      }
    } else {
      dispatch(playNextSong());
    }
  };

  const handlePrev = () => {
    // Allow clicking prev always, but skip exclusive songs for non-VIP users
    if (!user?.vip) {
      let prevIndex = currentSongIndex - 1;
      while (prevIndex >= 0 && currentSongList[prevIndex].exclusive) {
        prevIndex--;
      }
      if (prevIndex >= 0) {
        dispatch(setCurrentSongIndex(prevIndex));
        dispatch(setCurrentSong(currentSongList[prevIndex]));
        dispatch(setIsPlaying(true));
      } else {
        // If no non-exclusive prev song, just stop playing but allow button click
        dispatch(setIsPlaying(false));
      }
    } else {
      dispatch(playPrevSong());
    }
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
            className="text-sm text-gray-400"
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
            <div>Req: {(audioRef.current?.duration ? (audioRef.current.duration * 0.51).toFixed(1) : 0)}s</div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center w-1/3">
        <div className="flex gap-4 mb-2">
          <button onClick={handlePrev} disabled={!currentSongList?.length}>
            <SkipBack className="w-6 h-6" />
          </button>
          <button onClick={handlePlayPause}>
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button
            onClick={handleNext}
            disabled={!currentSongList?.length}
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
