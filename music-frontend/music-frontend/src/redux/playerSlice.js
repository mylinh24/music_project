import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSong: null,
  isPlaying: false,
  progress: 0,
  volume: 1,
  playbackRate: 1,
  currentSongList: [],
  currentSongIndex: 0,
  error: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
      state.progress = 0;
      state.error = null;
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setPlaybackRate: (state, action) => {
      state.playbackRate = action.payload;
    },
    setCurrentSongList: (state, action) => {
      state.currentSongList = action.payload;
    },
    setCurrentSongIndex: (state, action) => {
      state.currentSongIndex = action.payload;
    },
    playNextSong: (state) => {
      if (state.currentSongList.length > 0 && state.currentSongIndex < state.currentSongList.length - 1) {
        state.currentSongIndex += 1;
        state.currentSong = state.currentSongList[state.currentSongIndex];
        state.progress = 0;
        state.isPlaying = true;
        state.error = null;
      } else {
        state.isPlaying = false;
      }
    },
    playPrevSong: (state) => {
      if (state.currentSongList.length > 0 && state.currentSongIndex > 0) {
        state.currentSongIndex -= 1;
        state.currentSong = state.currentSongList[state.currentSongIndex];
        state.progress = 0;
        state.isPlaying = true;
        state.error = null;
      } else {
        state.isPlaying = false;
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isPlaying = false;
    },
  },
});

export const {
  setCurrentSong,
  setIsPlaying,
  setProgress,
  setVolume,
  setPlaybackRate,
  setCurrentSongList,
  setCurrentSongIndex,
  playNextSong,
  playPrevSong,
  setError,
} = playerSlice.actions;

export default playerSlice.reducer;