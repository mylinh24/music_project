
"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

const AudioPlayer = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { currentSong, isPlaying, progress, volume, playbackRate, currentSongList, currentSongIndex } = useSelector(
    (state: any) => state.player
  );
  const user = useSelector((state: any) => state.auth?.user);
  const audioRef = useRef<HTMLAudioElement>(null);



  // Hàm cập nhật tiến độ
  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !isNaN(audio.currentTime) && !isNaN(audio.duration)) {
      dispatch(setProgress(audio.currentTime));
    }
  }, [dispatch]);

  // Cập nhật nguồn âm thanh
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.audio_url) return;

    // Reset trạng thái lượt nghe khi chuyển bài hát mới

    // Chỉ cập nhật src nếu khác với nguồn hiện tại
    if (audio.src !== currentSong.audio_url) {
      audio.src = currentSong.audio_url;
      audio.currentTime = 0;
      dispatch(setProgress(0));
    }

    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audio.currentTime = progress;

  }, [currentSong, volume, playbackRate, dispatch]);

  // Xử lý phát/dừng
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(err => {
        dispatch(setError('Không thể phát âm thanh.'));
        dispatch(setIsPlaying(false));
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, dispatch, currentSong]);

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
    // No-op since listening session logic removed
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
  }, [dispatch, updateProgress, user, currentSongIndex, currentSongList]);

  const handlePlayPause = () => {
    if (!currentSong?.audio_url) {
      dispatch(setError('Không có bài hát được chọn.'));
      return;
    }

    const audio = audioRef.current;

  // Nếu đang chuyển từ pause sang play và chưa có session active
  if (!isPlaying && audio) {
    // no-op
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

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const newTime = (parseFloat(e.target.value) / 100) * audio.duration;
    audio.currentTime = newTime;
    dispatch(setProgress(newTime));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    dispatch(setVolume(newVolume));
  };

  const handlePlaybackRateChange = (rate: number) => {
    dispatch(setPlaybackRate(rate));
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSongClick = () => {
    if (currentSong?.id) {
      router.push(`/song/${currentSong.id}`);
    }
  };

  const handleArtistClick = () => {
    const artistId = currentSong?.artist?.id || currentSong?.artist_id;
    if (artistId) {
      router.push(`/artist/${artistId}`);
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
          onError={(e: any) => (e.target.src = 'https://via.placeholder.com/50x50?text=No+Image')}
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
