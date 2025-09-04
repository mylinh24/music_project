import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import HomePage from './pages/HomePage.jsx';
<<<<<<< HEAD
=======
import TestPage from './pages/TestPage.jsx';
import ArtistDetailPage from './pages/ArtistDetailPage.jsx';
import FavoritePage from './pages/FavoritePage.jsx';
import SongDetailPage from './pages/SongDetailPage.jsx';
>>>>>>> 14f427b2 (second commit)

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/home-page" element={<HomePage />} />
      <Route path="/" element={<HomePage />} />
<<<<<<< HEAD
=======
      <Route path="/test" element={<TestPage />} />
      <Route path="/artist/:artistId" element={<ArtistDetailPage />} />
      <Route path="/favorites" element={<FavoritePage />} />
      <Route path="/song/:id" element={<SongDetailPage />} />
>>>>>>> 14f427b2 (second commit)
    </Routes>
  );
}

export default App;