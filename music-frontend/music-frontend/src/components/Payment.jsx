import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Payment = () => {
  const [qrValue, setQrValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      setErrorMessage('Vui lòng đăng nhập để truy cập trang thanh toán.');
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
        const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:6969';
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
    } else if (user?.vip) {
      setIsVip(true);
    }
  }, [token, user?.vip, isVip]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Nâng cấp tài khoản VIP</h1>
      {isLoading ? (
        <p>Đang tạo mã QR...</p>
      ) : isVip ? (
        <p className="text-green-400">Bạn đã là thành viên VIP! Cảm ơn bạn!</p>
      ) : errorMessage ? (
        <p className="text-red-500">{errorMessage}</p>
      ) : qrValue ? (
        <div className="flex flex-col items-center">
          <p>Truy cập URL dưới đây để nâng cấp lên VIP (test only):</p>
          <p className="text-blue-400 break-all">{qrValue}</p>
          <p>Sau khi truy cập, hãy làm mới trang để kiểm tra trạng thái VIP.</p>
        </div>
      ) : (
        <p>Có lỗi xảy ra. Vui lòng thử lại sau.</p>
      )}
    </div>
  );
};

export default Payment;