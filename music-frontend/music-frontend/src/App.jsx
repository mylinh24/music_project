import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import AudioPlayer from './components/AudioPlayer';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ArtistDetailPage = lazy(() => import('./pages/ArtistDetailPage'));
const FavoritePage = lazy(() => import('./pages/FavoritePage'));
const SongDetailPage = lazy(() => import('./pages/SongDetailPage'));
const SongsPage = lazy(() => import('./pages/SongsPage'));
const ArtistsPage = lazy(() => import('./pages/ArtistsPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));

function App() {
  return (
    <Provider store={store}>
      <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Đang tải...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/home-page" element={<HomePage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/songs" element={<SongsPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/theloai/:category" element={<CategoryPage />} />
          <Route path="/artist/:artistId" element={<ArtistDetailPage />} />
          <Route path="/favorites" element={<FavoritePage />} />
          <Route path="/song/:id" element={<SongDetailPage />} />
        </Routes>
      </Suspense>
      <AudioPlayer /> {/* Thêm AudioPlayer ở cấp cao nhất */}
    </Provider>
  );
}

export default App;
