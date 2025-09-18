import React, { useState, useEffect } from 'react';
import { QRCode } from 'react-qrcode-logo';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { loadUser } from '../redux/authSlice';

const Payment = () => {
  const [qrValue, setQrValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) {
      setErrorMessage('Vui lòng đăng nhập để truy cập trang thanh toán.');
      return;
    }

    if (user?.vip) {
      setIsVip(true);
      return;
    }

    const fetchPaymentSession = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await axios.post(
          'http://localhost:6969/api/payment/create-session',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { sessionId, userId } = response.data;
        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://192.168.43.200:6969';
        setQrValue(`${baseUrl}/api/payment/simulate-success?sessionId=${sessionId}&userId=${userId}`);
      } catch (error) {
        const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Có lỗi xảy ra khi tạo phiên thanh toán.';
        setErrorMessage(message);
        console.error('Error creating payment session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isVip) {
      fetchPaymentSession();
    }
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Nâng cấp tài khoản VIP</h1>
      {isLoading ? (
        <p>Đang tạo mã QR...</p>
      ) : isVip ? (
        <p className="text-green-400">Bạn đã là thành viên VIP! Cảm ơn bạn!</p>
      ) : errorMessage ? (
        <p className="text-red-500">{errorMessage}</p>
      ) : qrValue ? (
        <div className="flex flex-col items-center">
          <p>Quét mã thanh toán dưới đây để nâng cấp lên VIP:</p>
          <QRCode value={qrValue} size={200} fgColor="#ffffff" bgColor="#111827" />
        </div>
      ) : (
        <p>Có lỗi xảy ra. Vui lòng thử lại sau.</p>
      )}
    </div>
  );
};

export default Payment;
