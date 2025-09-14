import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import playerReducer from './playerSlice';

export default configureStore({
    reducer: {
        auth: authReducer,
        player: playerReducer, // Thêm player reducer
    },
});