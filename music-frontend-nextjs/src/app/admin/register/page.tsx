'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AdminRegister = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/auth/register', {
        email,
        firstName,
        lastName,
        password,
        referralCode: referralCode || undefined,
      });
      setMessage('Registration successful. Please check your email for OTP.');
      setUserId(response.data.userId);
      setShowOtp(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await axios.post('http://localhost:3001/auth/verify-otp', {
        userId,
        otp,
        type: 'register',
      });
      setMessage('OTP verified successfully. Redirecting to login...');
      setTimeout(() => {
        router.push('/admin/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await axios.post('http://localhost:3001/auth/resend-otp', {
        email,
        type: 'register',
      });
      setMessage('OTP resent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <form onSubmit={showOtp ? handleVerifyOtp : handleRegister} className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Admin Register</h1>
        {message && <p className="mb-4 text-green-500">{message}</p>}
        {error && <p className="mb-4 text-red-500">{error}</p>}
        {!showOtp ? (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
            />
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
            />
            <input
              type="text"
              placeholder="Referral Code (optional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full mb-6 p-3 rounded bg-gray-700 text-white"
            />
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-semibold disabled:opacity-50">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full mb-4 p-3 rounded bg-gray-700 text-white"
            />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded font-semibold mb-4 disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" onClick={handleResendOtp} disabled={loading} className="w-full bg-gray-600 hover:bg-gray-700 py-3 rounded font-semibold disabled:opacity-50">
              {loading ? 'Resending...' : 'Resend OTP'}
            </button>
          </>
        )}
        <div className="mt-4 text-center">
          <a href="/admin/login" className="text-blue-400 hover:underline">
            Already have an account? Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default AdminRegister;
