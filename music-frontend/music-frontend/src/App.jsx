import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedAuthenticatedRoute from './components/ProtectedAuthenticatedRoute';
import { Provider } from 'react-redux';
import store from './redux/store';
import AudioPlayer from './components/AudioPlayer';
import HeaderWrapper from './components/HeaderWrapper';

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
const PaymentPage = lazy(() => import('./pages/Payment'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminSongs = lazy(() => import('./pages/AdminSongs'));
const AdminArtists = lazy(() => import('./pages/AdminArtists'));
const AdminSongDetail = lazy(() => import('./pages/AdminSongDetail'));
const AdminArtistDetail = lazy(() => import('./pages/AdminArtistDetail'));
const AdminAddArtist = lazy(() => import('./pages/AdminAddArtist'));
const AdminEditArtist = lazy(() => import('./pages/AdminEditArtist'));
const AdminAddSong = lazy(() => import('./pages/AdminAddSong'));
const AdminEditSong = lazy(() => import('./pages/AdminEditSong'));
const ProtectedAdminRoute = lazy(() => import('./components/ProtectedAdminRoute'));
const ProtectedUserRoute = lazy(() => import('./components/ProtectedUserRoute'));

function App() {
  const location = useLocation();

  // Pages that should NOT show the header
  const pagesWithoutHeader = ['/login', '/register', '/forgot-password', '/profile'];

  // Check if current page should show header
  const shouldShowHeader = !pagesWithoutHeader.includes(location.pathname);

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Chỉ hiển thị Header cho các trang được chỉ định */}
        {shouldShowHeader && <HeaderWrapper />}
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
            <Route path="/favorites" element={<ProtectedUserRoute><FavoritePage /></ProtectedUserRoute>} />
            <Route path="/song/:id" element={<SongDetailPage />} />
            <Route path="/payment" element={<ProtectedUserRoute><PaymentPage /></ProtectedUserRoute>} />
            <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/users" element={<ProtectedAdminRoute><AdminUsers /></ProtectedAdminRoute>} />
            <Route path="/admin/songs" element={<ProtectedAdminRoute><AdminSongs /></ProtectedAdminRoute>} />
            <Route path="/admin/add-song" element={<ProtectedAdminRoute><AdminAddSong /></ProtectedAdminRoute>} />
            <Route path="/admin/edit-song/:id" element={<ProtectedAdminRoute><AdminEditSong /></ProtectedAdminRoute>} />
            <Route path="/admin/song/:id" element={<ProtectedAdminRoute><AdminSongDetail /></ProtectedAdminRoute>} />
            <Route path="/admin/artists" element={<ProtectedAdminRoute><AdminArtists /></ProtectedAdminRoute>} />
            <Route path="/admin/add-artist" element={<ProtectedAdminRoute><AdminAddArtist /></ProtectedAdminRoute>} />
            <Route path="/admin/edit-artist/:artistId" element={<ProtectedAdminRoute><AdminEditArtist /></ProtectedAdminRoute>} />
            <Route path="/admin/artist/:artistId" element={<ProtectedAdminRoute><AdminArtistDetail /></ProtectedAdminRoute>} />
          </Routes>
        </Suspense>
        <AudioPlayer />
      </div>
    </Provider>
  );
}

export default App;