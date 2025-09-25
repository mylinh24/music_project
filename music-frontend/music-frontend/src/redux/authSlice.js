import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:6969/api/auth';

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async ({ userId, otp }, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/verify-otp`, { userId, otp });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        localStorage.setItem('token', response.data.token);

        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }
        const response = await axios.get(`${API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        localStorage.removeItem('token');
        return rejectWithValue('Failed to load user');
    }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/forgot-password`, { email });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ userId, otp, newPassword }, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password`, { userId, otp, newPassword });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const resendOTP = createAsyncThunk('auth/resendOTP', async (email, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/resend-otp`, { email });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: localStorage.getItem('token'),
        isAuthenticated: !!localStorage.getItem('token'),
        user: null,
        userId: null,
        status: 'idle',
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            state.token = null;
            state.isAuthenticated = false;
            state.user = null;
            state.userId = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.status = 'loading';
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userId = action.payload.userId;
                state.status = 'succeeded';
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.status = 'failed';
            })
            .addCase(verifyOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.status = 'loading';
            })
            .addCase(verifyOTP.fulfilled, (state) => {
                state.loading = false;
                state.userId = null;
                state.status = 'verified';
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.status = 'failed';
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.status = 'loading';
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.userId = action.payload.user.id;
                state.isAuthenticated = true;
                state.status = 'succeeded';
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.status = 'failed';
            })
            .addCase(loadUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.userId = action.payload.id || null;
                state.isAuthenticated = true;
            })
            .addCase(loadUser.rejected, (state, action) => {
                state.loading = false;
                state.token = null;
                state.isAuthenticated = false;
                state.user = null;
                state.userId = null;
                state.error = action.payload;
            })
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.status = 'loading';
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.userId = action.payload.userId;
                state.status = 'succeeded';
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.status = 'failed';
            })
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.status = 'loading';
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false;
                state.userId = null;
                state.status = 'succeeded';
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.status = 'failed';
            })
            .addCase(resendOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.status = 'loading';
            })
            .addCase(resendOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.userId = action.payload.userId;
                state.status = 'succeeded';
            })
            .addCase(resendOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.status = 'failed';
            });

    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;