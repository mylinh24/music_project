import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, resetPassword } from '../redux/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showReset, setShowReset] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, userId } = useSelector((state) => state.auth);

    const handleForgot = (e) => {
        e.preventDefault();
        dispatch(forgotPassword(email)).then(() => setShowReset(true));
    };

    const handleReset = (e) => {
        e.preventDefault();
        dispatch(resetPassword({ userId, otp, newPassword }))
            .unwrap()
            .then(() => {
                toast.success('Đặt lại mật khẩu thành công! Chuyển hướng về đăng nhập...', {
                    position: "top-center",
                    autoClose: 2000,
                });
                setTimeout(() => navigate('/login'), 2000);
            })
            .catch(() => {
                toast.error('Đặt lại mật khẩu thất bại!', { position: "top-center" });
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-center mb-6">
                    {showReset ? 'Đặt lại mật khẩu' : 'Quên mật khẩu'}
                </h2>

                {!showReset ? (
                    <form onSubmit={handleForgot}>
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
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Gửi OTP'}
                        </button>
                        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
                        <div className="mt-4 text-center">
                            <Link to="/login" className="text-blue-500 hover:underline">Quay lại đăng nhập</Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleReset}>
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
                        <div className="mb-4">
                            <label className="block text-gray-700">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                placeholder="Nhập mật khẩu mới"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                        </button>
                        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
                    </form>
                )}
            </div>

            {/* Toast notification container */}
            <ToastContainer />
        </div>
    );
};

export default ForgotPasswordForm;
