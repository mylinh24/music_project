import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSong: null,
  isPlaying: false,
  progress: 0,
  playbackRate: 1,
  currentSongList: [],
  currentSongIndex: -1,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
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
      if (state.currentSongList.length === 0 || state.currentSongIndex === -1) return;
      const nextIndex = (state.currentSongIndex + 1) % state.currentSongList.length;
      state.currentSong = state.currentSongList[nextIndex];
      state.currentSongIndex = nextIndex;
      state.isPlaying = true;
    },
    playPrevSong: (state) => {
      if (state.currentSongList.length === 0 || state.currentSongIndex === -1) return;
      const prevIndex = state.currentSongIndex === 0 ? state.currentSongList.length - 1 : state.currentSongIndex - 1;
      state.currentSong = state.currentSongList[prevIndex];
      state.currentSongIndex = prevIndex;
      state.isPlaying = true;
    },
  },
});

export const {
  setCurrentSong,
  setIsPlaying,
  setProgress,
  setPlaybackRate,
  setCurrentSongList,
  setCurrentSongIndex,
  playNextSong,
  playPrevSong,
} = playerSlice.actions;

export default playerSlice.reducer;
