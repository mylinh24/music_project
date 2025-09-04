<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
=======
import React, { useEffect, useState, useRef } from 'react';
>>>>>>> 14f427b2 (second commit)
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import axios from 'axios';
<<<<<<< HEAD
=======
import { ArrowLeft } from 'lucide-react'; // icon back

const DEFAULT_AVATAR = 'https://via.placeholder.com/150?text=Avatar';
>>>>>>> 14f427b2 (second commit)

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
<<<<<<< HEAD

  // Lấy thông tin người dùng từ API khi component được tải
=======
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
  const fileInputRef = useRef(null);

>>>>>>> 14f427b2 (second commit)
  useEffect(() => {
    if (isAuthenticated && token) {
      axios
        .get('http://localhost:6969/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUserData(response.data);
<<<<<<< HEAD
=======
          setFormData({
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            email: response.data.email || '',
            avatar: null,
          });
          setAvatarPreview(response.data.avatar || DEFAULT_AVATAR);
>>>>>>> 14f427b2 (second commit)
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

<<<<<<< HEAD
  // Nếu chưa đăng nhập, hiển thị thông báo yêu cầu đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-700">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
          <Link to="/login" className="text-blue-500 hover:underline">
=======
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      if (formData.avatar) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result;
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.avatar);
        });
        dataToSend.avatar = base64;
      }

      const response = await axios.post(
        'http://localhost:6969/api/update-profile',
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setUserData(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        avatar: null,
      });
      setAvatarPreview(response.data.avatar || DEFAULT_AVATAR);
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-200 to-purple-200">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-700 mb-4">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
          <Link
            to="/login"
            className="px-5 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition"
          >
>>>>>>> 14f427b2 (second commit)
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
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
=======
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 py-10">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 relative">
        {/* Nút quay lại trang chủ */}
        {!editMode && (
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft size={20} /> <span className="font-medium">Trang Chủ</span>
          </button>
        )}

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Thông Tin Cá Nhân
        </h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {userData ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-md"
                onError={(e) => (e.target.src = DEFAULT_AVATAR)}
              />
              {editMode && (
                <div className="mt-3 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="block w-full text-sm text-gray-600"
                  />
                </div>
              )}
            </div>

            {editMode ? (
              <div className="w-full space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Họ</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Tên</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-600 transition"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-semibold shadow hover:bg-gray-500 transition"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-4 text-gray-700">
                <p>
                  <span className="font-semibold">Email:</span>{' '}
                  {userData.email || 'Chưa cập nhật'}
                </p>
                <p>
                  <span className="font-semibold">Họ:</span>{' '}
                  {userData.firstName || 'Chưa cập nhật'}
                </p>
                <p>
                  <span className="font-semibold">Tên:</span>{' '}
                  {userData.lastName || 'Chưa cập nhật'}
                </p>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-600 transition"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold shadow hover:bg-red-600 transition"
                  >
                    Đăng Xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600 text-center">Đang tải thông tin...</p>
        )}
>>>>>>> 14f427b2 (second commit)
      </div>
    </div>
  );
};

export default ProfilePage;
