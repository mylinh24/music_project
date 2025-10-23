import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout } from '../redux/authSlice';

const DEFAULT_AVATAR =
  'https://res.cloudinary.com/di1eiccl8/image/upload/v1757750263/js1gl8rqTcqd6_yWH0qzMw_j0f0cl.webp';

const HeaderAdmin = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      const fetchUserInfo = async () => {
        try {
          const response = await axios.get(`http://localhost:6969/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = response.data;
          if (userData) {
            setFullName(
              `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
              'Admin'
            );
            let avatar = DEFAULT_AVATAR;
            if (userData.avatar && typeof userData.avatar === 'string') {
              if (userData.avatar.startsWith('data:image/')) {
                avatar = userData.avatar;
              } else if (userData.avatar.match(/\.(jpeg|jpg|png|gif)$/i)) {
                avatar = userData.avatar;
              }
            }
            setAvatarUrl(avatar);
          } else {
            setAvatarUrl(DEFAULT_AVATAR);
            setFullName('Admin');
          }
        } catch (error) {
          setAvatarUrl(DEFAULT_AVATAR);
          setFullName('Admin');
        }
      };
      fetchUserInfo();
    } else {
      setAvatarUrl(DEFAULT_AVATAR);
      setFullName('');
    }
  }, [isAuthenticated, token]);

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    setAvatarUrl(DEFAULT_AVATAR);
    setFullName('');
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-red-900 text-white shadow-md z-50">
      {/* Bên trái */}
      <div className="flex space-x-6">
        <Link to="/admin" className="text-red-400 hover:underline font-semibold">
          Admin Dashboard
        </Link>
        <Link to="/admin/users" className="text-red-400 hover:underline font-semibold">
          Quản lý Users
        </Link>
        <Link to="/admin/songs" className="text-red-400 hover:underline font-semibold">
          Quản lý Songs
        </Link>
        <Link to="/admin/artists" className="text-red-400 hover:underline font-semibold">
          Quản lý Artists
        </Link>
        <Link to="/admin/comments" className="text-red-400 hover:underline font-semibold">
          Quản lý Comments
        </Link>
        <Link to="/admin/vip-packages" className="text-red-400 hover:underline font-semibold">
          Quản lý Gói VIP
        </Link>
      </div>

      {/* Bên phải */}
      <div className="relative" ref={menuRef}>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <span className="text-red-400 font-semibold">Admin Panel</span>
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-red-400 hover:underline font-semibold"
            >
              {fullName || 'Admin'}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-[100px] w-48 bg-red-800 rounded-lg shadow-lg z-10">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-white hover:bg-red-700"
                  onClick={() => setMenuOpen(false)}
                >
                  Hồ sơ
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-red-700"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="text-red-400 hover:underline font-semibold"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
};

export default HeaderAdmin;
