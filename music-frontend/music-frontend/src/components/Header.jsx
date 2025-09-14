import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout } from '../redux/authSlice';

const DEFAULT_AVATAR =
  'https://res.cloudinary.com/di1eiccl8/image/upload/v1757750263/js1gl8rqTcqd6_yWH0qzMw_j0f0cl.webp';

const Header = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
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
              'Người dùng'
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
            setFullName('Người dùng');
          }
        } catch (error) {
          setAvatarUrl(DEFAULT_AVATAR);
          setFullName('Người dùng');
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
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-gray-900 text-white shadow-md z-50">
      {/* Bên trái */}
      <div className="flex space-x-6">
        <Link to="/" className="text-green-400 hover:underline font-semibold">
          Trang chủ
        </Link>
        <Link to="/songs" className="text-green-400 hover:underline font-semibold">
          Bài hát
        </Link>
        <Link to="/artists" className="text-green-400 hover:underline font-semibold">
          Ca sĩ
        </Link>
        <div className="relative group">
          <button className="text-green-400 hover:underline font-semibold">
            Thể loại
          </button>
          <div className="absolute left-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50">
            <Link to="/theloai/pop" className="block px-4 py-2 hover:bg-gray-700">
              Pop
            </Link>
            <Link to="/theloai/rock" className="block px-4 py-2 hover:bg-gray-700">
              Rock
            </Link>
            <Link to="/theloai/ballad" className="block px-4 py-2 hover:bg-gray-700">
              Ballad
            </Link>
          </div>
        </div>

      </div>



      {/* Bên phải */}
      <div className="relative" ref={menuRef}>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
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
              className="text-green-400 hover:underline font-semibold"
            >
              {fullName || 'Tài khoản'}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-[100px] w-48 bg-gray-800 rounded-lg shadow-lg z-10">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-white hover:bg-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  Hồ sơ
                </Link>
                <Link
                  to="/favorites"
                  className="block px-4 py-2 text-white hover:bg-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  Bài hát yêu thích của tôi
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="text-green-400 hover:underline font-semibold"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
