import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Song {
  id: number;
  title: string;
  artist: { id: number; name: string };
  audio_url: string;
  image_url: string;
  lyrics: string;
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  playbackRate: number;
  currentSongList: Song[];
  currentSongIndex: number;
  error: string | null;
}

const initialState: PlayerState = {
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
    setCurrentSong: (state, action: PayloadAction<Song>) => {
      state.currentSong = action.payload;
      state.progress = 0;
      state.error = null;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    setPlaybackRate: (state, action: PayloadAction<number>) => {
      state.playbackRate = action.payload;
    },
    setCurrentSongList: (state, action: PayloadAction<Song[]>) => {
      state.currentSongList = action.payload;
    },
    setCurrentSongIndex: (state, action: PayloadAction<number>) => {
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
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isPlaying = false;
    },
  },
});

export const { setCurrentSong, setIsPlaying, setProgress, setVolume, setPlaybackRate, setCurrentSongList, setCurrentSongIndex, playNextSong, playPrevSong, setError } = playerSlice.actions;
export default playerSlice.reducer;
