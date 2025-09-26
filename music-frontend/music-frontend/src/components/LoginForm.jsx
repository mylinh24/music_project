import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/authSlice';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin'); // Redirect to Admin Dashboard for admin
      } else {
        navigate('/home-page'); // Redirect to HomePage for regular users
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
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
          <button
            type="submit"
            className="w-full bg-green-400 text-white p-2 rounded hover:bg-green-500 disabled:bg-green-300"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-green-400 hover:underline">Quên mật khẩu?</Link>
          </div>
          <div className="mt-2 text-center">
            <Link to="/register" className="text-green-400 hover:underline">Chưa có tài khoản? Đăng ký</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
