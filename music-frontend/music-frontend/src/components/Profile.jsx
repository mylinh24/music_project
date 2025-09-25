import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import axios from 'axios';
import { ArrowLeft, Copy, Users, Gift } from 'lucide-react'; // icon back
import ContributionPoints from './ContributionPoints';

const DEFAULT_AVATAR = 'https://via.placeholder.com/150?text=Avatar';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(DEFAULT_AVATAR);
  const fileInputRef = useRef(null);

  // Referral states
  const [referralData, setReferralData] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState(null);
  const [showReferral, setShowReferral] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      axios
        .get('http://localhost:6969/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUserData(response.data);
          setFormData({
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            email: response.data.email || '',
            avatar: null,
          });
          setAvatarPreview(response.data.avatar || DEFAULT_AVATAR);
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

  // Referral functions
  const generateReferralCode = async () => {
    setReferralLoading(true);
    setReferralError(null);
    try {
      const response = await axios.post(
        'http://localhost:6969/api/referral/generate',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReferralData(response.data);
    } catch (err) {
      setReferralError(err.response?.data?.error || 'Lỗi khi tạo mã giới thiệu');
    } finally {
      setReferralLoading(false);
    }
  };

  const getReferralStats = async () => {
    setReferralLoading(true);
    setReferralError(null);
    try {
      const response = await axios.get(
        'http://localhost:6969/api/referral/stats',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReferralData(response.data);
    } catch (err) {
      setReferralError(err.response?.data?.error || 'Lỗi khi lấy thống kê');
    } finally {
      setReferralLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-200 to-purple-200 pt-[100px]">
        <div className="max-w-sm w-full bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-gray-700 text-sm mb-3">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
          <Link
            to="/login"
            className="px-4 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium shadow hover:bg-blue-600 transition"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 py-8 pt-[100px]">
      <div className="max-w-6xl mx-auto px-4  mb-20">
        <div className="flex gap-6 overflow-x-auto pb-4">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md p-8 relative flex-shrink-0 w-96">
            {/* Nút quay lại trang chủ */}
            {!editMode && (
              <button
                onClick={() => navigate('/')}
                className="absolute top-3 left-3 flex items-center gap-1 text-gray-600 hover:text-gray-800 transition"
              >
                <ArrowLeft size={16} /> <span className="text-sm font-medium">Trang Chủ</span>
              </button>
            )}

            <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Thông Tin Cá Nhân
            </h1>

            {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

            {userData ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-3 border-blue-200 shadow-sm"
                    onError={(e) => (e.target.src = DEFAULT_AVATAR)}
                  />
                  {editMode && (
                    <div className="mt-2 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="block w-full text-xs text-gray-600"
                      />
                    </div>
                  )}
                </div>

                {editMode ? (
                  <div className="w-full space-y-3">
                    <div>
                      <label className="block text-gray-700 font-medium text-sm mb-1">Họ</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium text-sm mb-1">Tên</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium text-sm mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full p-2 border rounded-lg bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium shadow hover:bg-blue-600 transition"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex-1 bg-gray-400 text-white py-2 rounded-lg text-sm font-medium shadow hover:bg-gray-500 transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-3 text-gray-700 text-sm">
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

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium shadow hover:bg-blue-600 transition"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium shadow hover:bg-red-600 transition"
                      >
                        Đăng Xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-sm text-center">Đang tải thông tin...</p>
            )}
          </div>

          {/* Contribution Points Card */}
          <div className="flex items-start flex-shrink-0 w-80">
            <ContributionPoints />
          </div>

          {/* Referral Card */}
          <div className="bg-white rounded-xl shadow-md p-6 flex-shrink-0 w-80">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="text-green-500" size={20} />
              <h2 className="text-xl font-bold text-gray-800">Giới Thiệu Bạn Bè</h2>
            </div>

            {referralError && <p className="text-red-500 text-sm mb-3">{referralError}</p>}

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowReferral(!showReferral);
                  if (!showReferral) {
                    getReferralStats();
                  }
                }}
                className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium shadow hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <Users size={16} />
                {showReferral ? 'Ẩn' : 'Hiển thị'} Mã Giới Thiệu
              </button>

              {showReferral && (
                <div className="space-y-3">
                  {!referralData && !referralLoading && (
                    <button
                      onClick={generateReferralCode}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium shadow hover:bg-blue-600 transition"
                    >
                      Tạo Mã Giới Thiệu
                    </button>
                  )}

                  {referralLoading && (
                    <p className="text-gray-600 text-sm text-center">Đang tải...</p>
                  )}

                  {referralData && (
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg text-black">
                        <p className="text-sm text-gray-600 mb-1">Mã giới thiệu:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white p-2 rounded border text-sm font-mono">
                            {referralData.referral_code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(referralData.referral_code)}
                            className="p-2 text-gray-500 hover:text-gray-700 active:scale-95 active:text-gray-900 transition cursor-pointer"
                            title="Sao chép mã"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg text-black">
                        <p className="text-sm text-gray-600 mb-1 ">Link giới thiệu:</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={referralData.referral_link || (referralData.referral_code ? `${window.location.origin}/register?ref=${referralData.referral_code}` : `${window.location.origin}/register`)}
                            readOnly
                            className="flex-1 bg-white p-2 rounded border text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(referralData.referral_link || (referralData.referral_code ? `${window.location.origin}/register?ref=${referralData.referral_code}` : `${window.location.origin}/register`))}
                            className="p-2 text-gray-500 hover:text-gray-700 active:scale-95 active:text-gray-900 transition cursor-pointer"
                            title="Sao chép link"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <p className="text-blue-600 font-semibold">{referralData.referral_count || 0}</p>
                          <p className="text-gray-600">Lượt giới thiệu</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <p className="text-green-600 font-semibold">{referralData.total_points || 0}</p>
                          <p className="text-gray-600">Điểm nhận được</p>
                        </div>
                      </div>

                      {/* Danh sách user được giới thiệu */}
                      {referralData.referred_users && referralData.referred_users.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Danh sách bạn bè đã giới thiệu ({referralData.referred_users.length})</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {referralData.referred_users.map((user, index) => (
                              <div key={index} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-gray-500">{user.email}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-green-600 font-medium">+50 điểm</p>
                                  <p className="text-gray-400 text-xs">
                                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 text-center">
                        <p>💰 Nhận 50 điểm cho mỗi bạn bè đăng ký thành công!</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
