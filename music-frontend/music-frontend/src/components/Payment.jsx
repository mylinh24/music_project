import React, { useState, useEffect } from 'react';
import { QRCode } from 'react-qrcode-logo';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { loadUser } from '../redux/authSlice';
import { Gift, Calculator } from 'lucide-react';

const Payment = () => {
  const [qrValue, setQrValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Points conversion states
  const [userPoints, setUserPoints] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToConvert, setPointsToConvert] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

  // VIP packages states
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Constants
  const POINTS_TO_VND_RATE = 5000; // 50 points = 5000 VND
  const POINTS_PER_CONVERSION = 50;

  // Fetch user points
  const fetchUserPoints = async () => {
    try {
      console.log('Fetching user points with token:', token ? 'Token exists' : 'No token');

      // Try authenticated endpoint first
      if (token) {
        try {
          const response = await axios.get('http://localhost:6969/api/payment/user-points', {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('User points response:', response.data);
          const points = response.data.points || 0;
          console.log('Setting user points to:', points);
          setUserPoints(points);
          return;
        } catch (authError) {
          console.log('Authenticated endpoint failed, trying test endpoint:', authError.message);
        }
      }

      // Fallback to test endpoint (no authentication required)
      const response = await axios.get('http://localhost:6969/api/payment/test-points');
      console.log('Test endpoint response:', response.data);
      const points = response.data.points || 0;
      console.log('Setting user points to (from test):', points);
      setUserPoints(points);
    } catch (error) {
      console.error('Error fetching user points:', error);
      // If user doesn't have points in database, set to 0
      console.log('User has no points in database, setting to 0');
      setUserPoints(0);
    }
  };

  // Fetch VIP packages
  const fetchVipPackages = async () => {
    try {
      const response = await axios.get('http://localhost:6969/api/payment/vip-packages');
      console.log('VIP packages response:', response.data);
      const packagesData = response.data.packages || [];
      setPackages(packagesData);
      if (packagesData.length > 0) {
        setSelectedPackage(packagesData[0]); // Select first package by default
        setFinalAmount(packagesData[0].price);
      }
    } catch (error) {
      console.error('Error fetching VIP packages:', error);
      setErrorMessage('Không thể tải gói VIP. Vui lòng thử lại sau.');
    }
  };

  // Calculate discount based on points
  const calculateDiscount = (points) => {
    if (!points || points <= 0) return 0;

    const fullConversions = Math.floor(points / POINTS_PER_CONVERSION);
    const discount = fullConversions * POINTS_TO_VND_RATE;

    return {
      discountAmount: discount,
      pointsUsed: fullConversions * POINTS_PER_CONVERSION,
      remainingPoints: points % POINTS_PER_CONVERSION
    };
  };

  // Handle points conversion toggle
  const handlePointsToggle = (checked) => {
    setUsePoints(checked);
    // Clear existing QR code when settings change
    setQrValue('');
    setErrorMessage('');

    if (!checked) {
      setPointsToConvert(0);
      setDiscountAmount(0);
      setFinalAmount(selectedPackage?.price || 0);
    } else {
      // Set default to minimum conversion (50 points)
      const defaultPoints = Math.min(POINTS_PER_CONVERSION, userPoints);
      setPointsToConvert(defaultPoints);
      const discountInfo = calculateDiscount(defaultPoints);
      setDiscountAmount(discountInfo.discountAmount);
      setFinalAmount((selectedPackage?.price || 0) - discountInfo.discountAmount);
    }
  };

  // Handle points input change
  const handlePointsChange = (value) => {
    const points = parseInt(value) || 0;

    // Validate points
    if (points > userPoints) {
      toast.error('Số điểm không được vượt quá số điểm hiện có');
      return;
    }

    if (points % POINTS_PER_CONVERSION !== 0) {
      toast.error('Số điểm phải là bội số của 50');
      return;
    }

    // Clear existing QR code when points change
    setQrValue('');
    setErrorMessage('');

    setPointsToConvert(points);
    const discountInfo = calculateDiscount(points);
    setDiscountAmount(discountInfo.discountAmount);
    setFinalAmount((selectedPackage?.price || 0) - discountInfo.discountAmount);
  };

  // Function to create payment session
  const fetchPaymentSession = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const paymentData = {
        packageId: selectedPackage?.id,
        usePoints,
        pointsToConvert: usePoints ? pointsToConvert : 0
      };

      const response = await axios.post(
        'http://localhost:6969/api/payment/create-session',
        paymentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Payment session response:', response.data);
      const { sessionId, userId, qrData } = response.data;
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://192.168.1.93:6969';

      // Create QR code with URL that points to payment success page
      const pointsUsed = usePoints ? pointsToConvert : 0;
      const qrUrl = `${baseUrl}/api/payment/simulate-success?sessionId=${sessionId}&userId=${userId}&pointsUsed=${pointsUsed}&amount=${finalAmount}&packageId=${selectedPackage?.id}`;

      setQrValue(qrUrl);
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Có lỗi xảy ra khi tạo phiên thanh toán.';
      setErrorMessage(message);
      console.error('Error creating payment session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user points and VIP packages on component mount
  useEffect(() => {
    if (token) {
      fetchUserPoints();
      fetchVipPackages();
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setErrorMessage('Vui lòng đăng nhập để truy cập trang thanh toán.');
      return;
    }

    if (user?.vip) {
      setIsVip(true);
      return;
    }

    // Don't auto-generate QR code - let user click the button
  }, [token, user?.vip, isVip]);

  useEffect(() => {
    if (qrValue && !user?.vip) {
      const interval = setInterval(() => {
        dispatch(loadUser());
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [qrValue, user?.vip, dispatch]);

  useEffect(() => {
    if (isVip) {
      toast.success('Nâng cấp VIP thành công! Đang chuyển đến trang chủ...');
      setTimeout(() => {
        navigate('/home-page');
      }, 3000);
    }
  }, [isVip, navigate]);

  return (
    <div className="container mx-auto px-4 py-8 pt-20 pb-24">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Nâng cấp tài khoản VIP</h1>

      {/* VIP Package Selection */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold">Chọn gói VIP</h2>
        </div>

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => {
                  setSelectedPackage(pkg);
                  setFinalAmount(usePoints ? pkg.price - discountAmount : pkg.price);
                  setQrValue(''); // Clear QR when package changes
                  setErrorMessage('');
                }}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${selectedPackage?.id === pkg.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                  }`}
              >
                <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-gray-300 text-sm mb-2">{pkg.description}</p>
                <p className="text-yellow-400 font-bold text-xl">{pkg.price.toLocaleString()} VND</p>
                <p className="text-gray-400 text-xs">Thời hạn: {pkg.duration} ngày</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Đang tải gói VIP...</p>
        )}
      </div>

      {/* Points Conversion Section - Always show the interface */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold">Quy đổi điểm thành tiền</h2>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 mb-2">
            💰 Tỷ lệ quy đổi: <span className="text-green-400 font-bold">50 điểm = 5,000 VND</span>
          </p>
          <p className="text-gray-300">
            📊 Điểm hiện có: <span className="text-blue-400 font-bold">{userPoints.toLocaleString()} điểm</span>
          </p>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="usePoints"
            checked={usePoints}
            onChange={(e) => handlePointsToggle(e.target.checked)}
            disabled={userPoints === 0}
            className={`w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-green-500 ${userPoints === 0
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-green-400 cursor-pointer'
              }`}
          />
          <label
            htmlFor="usePoints"
            className={`text-white ${userPoints === 0 ? 'text-gray-400' : ''}`}
          >
            Sử dụng điểm để giảm giá thanh toán
            {userPoints === 0 && (
              <span className="text-gray-400 text-sm ml-2">
                (Cần có điểm để sử dụng tính năng này)
              </span>
            )}
          </label>
        </div>

        {usePoints && userPoints > 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Số điểm muốn quy đổi (bội số của 50):
              </label>
              <input
                type="number"
                min="50"
                max={userPoints}
                step="50"
                value={pointsToConvert}
                onChange={(e) => handlePointsChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập số điểm (bội số của 50)"
              />
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Giá gốc:</span>
                <span className="text-white font-medium">{selectedPackage?.price.toLocaleString() || 0} VND</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Giảm giá từ điểm:</span>
                <span className="text-green-400 font-medium">-{discountAmount.toLocaleString()} VND</span>
              </div>
              <hr className="border-gray-600 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">Tổng thanh toán:</span>
                <span className="text-yellow-400 font-bold text-xl">{finalAmount.toLocaleString()} VND</span>
              </div>
              <div className="text-sm text-gray-400 mt-2">
                💾 Tiết kiệm: {discountAmount.toLocaleString()} VND từ {pointsToConvert} điểm
              </div>
            </div>
          </div>
        )}

        {userPoints === 0 && (
          <div className="bg-gray-700 rounded-lg p-4 mt-4">
            <div className="text-center">
              <p className="text-gray-400 mb-2">💡 Bạn chưa có điểm để quy đổi</p>
              <p className="text-gray-500 text-sm">
                Hãy tham gia các hoạt động để kiếm điểm và sử dụng tính năng này!
              </p>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <p>Đang tạo mã QR...</p>
      ) : isVip ? (
        <p className="text-green-400">Bạn đã là thành viên VIP! Cảm ơn bạn!</p>
      ) : errorMessage ? (
        <p className="text-red-500">{errorMessage}</p>
      ) : qrValue ? (
        <div className="flex flex-col items-center">
          <div className="bg-gray-800 rounded-lg p-4 mb-4 text-center">
            <p className="text-gray-300 mb-2">📱 Quét mã QR để thanh toán</p>
            <p className="text-white font-medium">
              Số tiền: <span className="text-yellow-400">{finalAmount.toLocaleString()} VND</span>
            </p>
            {usePoints && discountAmount > 0 && (
              <p className="text-green-400 text-sm">
                (Đã giảm {discountAmount.toLocaleString()} VND từ {pointsToConvert} điểm)
              </p>
            )}
          </div>
          <QRCode value={qrValue} size={200} fgColor="#ffffff" bgColor="#111827" />
          <p className="text-gray-400 text-sm mt-2">
            🔗 Quét để hoàn tất thanh toán VIP
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <button
            onClick={fetchPaymentSession}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg mb-4 transition-colors duration-200"
          >
            {isLoading ? 'Đang tạo mã QR...' : '🛒 Thanh toán'}
          </button>
          <p className="text-gray-400 text-sm">
            Nhấn nút để tạo mã QR thanh toán
          </p>
        </div>
      )}
    </div>
  );
};

export default Payment;
