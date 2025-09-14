import React, { useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
  const audioRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);

  // Cập nhật isPlayingRef khi isPlaying thay đổi
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

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
        } catch (err) {
          dispatch(setError('Không thể phát âm thanh.'));
          dispatch(setIsPlaying(false));
        }
      } else {
        audio.pause();
      }
    };

    playAudio();
  }, [currentSong, isPlaying, volume, playbackRate, dispatch]);

  // Xử lý sự kiện timeupdate và ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      dispatch(playNextSong());
    };

    // Gắn sự kiện timeupdate với tần suất cập nhật nhanh hơn
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [dispatch, updateProgress]);

  const handlePlayPause = () => {
    if (!currentSong?.audio_url) {
      dispatch(setError('Không có bài hát được chọn.'));
      return;
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
