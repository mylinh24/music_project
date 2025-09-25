import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, verifyOTP, resendOTP } from "../redux/authSlice";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      .then(() => setShowOtp(true))
      .catch(() => toast.error("Đăng ký thất bại, vui lòng thử lại!"));
  };

  const handleVerify = (e) => {
    e.preventDefault();
    dispatch(verifyOTP({ userId, otp }));
  };

  const handleResendOTP = (e) => {
    e.preventDefault();
    console.log('Sending resend OTP request with email:', email); // Thêm log để debug
    if (!email) {
      toast.error("Vui lòng nhập email trước khi gửi lại OTP!");
      return;
    }
    dispatch(resendOTP(email))
      .then(() => toast.success("OTP đã được gửi lại! Vui lòng kiểm tra email."))
      .catch(() => toast.error("Gửi lại OTP thất bại, vui lòng thử lại!"));
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
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      setTimeout(() => navigate("/login"), 2000);
    }
    if (error) {
      toast.error(error);
    }
  }, [status, error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 ">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 mt-0 mb-20 ">
        <h2 className="text-2xl font-bold text-center">
          {showOtp ? "Xác thực OTP" : "Đăng ký"}
        </h2>
        {!showOtp ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Họ</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Nhập họ"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Tên</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Nhập tên"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Nhập email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Mã giới thiệu (tích điểm cho người giới thiệu)</label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Nhập mã giới thiệu nếu có"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-blue-500 hover:underline"
              >
                Đã có tài khoản? Đăng nhập
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div className="mb-4">
              <label className="block text-gray-700">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Nhập OTP"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác thực OTP"}
            </button>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-blue-500 hover:underline"
                disabled={loading}
              >
                Gửi lại OTP
              </button>
            </div>
          </form>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default RegisterForm;