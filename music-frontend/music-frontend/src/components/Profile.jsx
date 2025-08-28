import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import axios from 'axios';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  // Lấy thông tin người dùng từ API khi component được tải
  useEffect(() => {
    if (isAuthenticated && token) {
      axios
        .get('http://localhost:6969/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUserData(response.data);
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Lỗi khi lấy thông tin hồ sơ');
          if (err.response?.status === 401) {
            dispatch(logout());
            navigate('/');
          }
        });
    }
  }, [isAuthenticated, token, dispatch, navigate]);

  // Nếu chưa đăng nhập, hiển thị thông báo yêu cầu đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-700">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
          <Link to="/login" className="text-blue-500 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  // Xử lý đăng xuất
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Xử lý chỉnh sửa hồ sơ
  const handleEditProfile = () => {
    navigate('/edit-profile'); // Điều hướng sang trang chỉnh sửa hồ sơ
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Hồ Sơ Người Dùng</h1>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Thông Tin Cá Nhân</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          {userData ? (
            <>
              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-semibold">Email:</span> {userData.email || 'Chưa cập nhật'}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-semibold">Họ:</span> {userData.firstName || 'Chưa cập nhật'}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-gray-700">
                  <span className="font-semibold">Tên:</span> {userData.lastName || 'Chưa cập nhật'}
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-center">Đang tải thông tin...</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleEditProfile}
              className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Chỉnh sửa
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              Đăng Xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
