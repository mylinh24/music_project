import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, verifyOTP, resendOTP } from "../redux/authSlice";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, userId, status } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    const registrationData = { email, password, firstName, lastName };
    if (referralCode.trim()) {
      registrationData.referralCode = referralCode.trim();
    }
    dispatch(registerUser(registrationData))
      .then(() => setShowOtp(true));
  };

  const handleVerify = (e) => {
    e.preventDefault();
    dispatch(verifyOTP({ userId, otp }));
  };

  const handleResendOTP = (e) => {
    e.preventDefault();
    console.log('Sending resend OTP request with email:', email); // Thêm log để debug
    if (!email) {
      return;
    }
    dispatch(resendOTP(email));
  };

  useEffect(() => {
    // Get referral code from URL parameters
    const refCode = searchParams.get('ref');
    if (refCode && refCode !== 'null' && refCode.trim() !== '') {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "verified") {
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-900 p-8">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          {showOtp ? "Xác thực OTP" : "Đăng ký"}
        </h2>
        {!showOtp ? (
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <label className="block text-gray-300">Họ</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Nhập họ"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-300">Tên</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Nhập tên"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Nhập email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300">Mã giới thiệu (tích điểm cho người giới thiệu)</label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Nhập mã giới thiệu nếu có"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-400 text-white p-2 rounded hover:bg-green-500 disabled:bg-green-300"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-green-400 hover:underline"
              >
                Đã có tài khoản? Đăng nhập
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="mb-4">
              <label className="block text-gray-300">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Nhập OTP"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-400 text-white p-2 rounded hover:bg-green-500 disabled:bg-green-300"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác thực OTP"}
            </button>
            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-green-400 hover:underline"
                disabled={loading}
              >
                Gửi lại OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;