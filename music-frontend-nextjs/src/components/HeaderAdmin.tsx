'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '../utils/apiClient';

const DEFAULT_AVATAR =
  'https://res.cloudinary.com/di1eiccl8/image/upload/v1757750263/js1gl8rqTcqd6_yWH0qzMw_j0f0cl.webp';

const HeaderAdmin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Fetch admin profile
      apiClient.get('/auth/me').then((res: any) => {
        setFullName(`${res.data.firstName || ''} ${res.data.lastName || ''}`.trim() || res.data.email);
        let avatar = DEFAULT_AVATAR;
        if (res.data.avatar && typeof res.data.avatar === 'string') {
          if (res.data.avatar.startsWith('data:image/')) {
            avatar = res.data.avatar;
          } else if (res.data.avatar.match(/\.(jpeg|jpg|png|gif)$/i)) {
            avatar = res.data.avatar;
          } else {
            // Assume base64
            avatar = 'data:image/png;base64,' + res.data.avatar;
          }
        }
        setAvatarUrl(avatar);
      }).catch(() => {
        setFullName('Tài khoản');
        setAvatarUrl(DEFAULT_AVATAR);
      });
    } else {
      setIsLoggedIn(false);
      setFullName('');
      setAvatarUrl(DEFAULT_AVATAR);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Xóa token
    setIsLoggedIn(false);
    setFullName('');
    setAvatarUrl(DEFAULT_AVATAR);
    setMenuOpen(false);
    router.push('/'); // Redirect về trang chủ
  };

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-red-900 text-white shadow-md z-50">
      {/* Left side */}
      <div className="flex space-x-6">
        <Link href="/admin/dashboard" className="text-red-400 hover:underline font-semibold">
          Admin Dashboard
        </Link>
        <Link href="/admin/users" className="text-red-400 hover:underline font-semibold">
          Quản lý Users
        </Link>
        <Link href="/admin/songs" className="text-red-400 hover:underline font-semibold">
          Quản lý Songs
        </Link>
        <Link href="/admin/artists" className="text-red-400 hover:underline font-semibold">
          Quản lý Artists
        </Link>
      </div>

      {/* Right side */}
      {isLoggedIn ? (
        <div className="relative" ref={menuRef}>
          <div className="flex items-center gap-2">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
              }}
            />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-red-400 hover:underline font-semibold"
            >
              {fullName}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-[100px] w-48 bg-red-800 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-red-700"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => router.push('/admin/login')}
          className="text-red-400 hover:underline font-semibold"
        >
          Đăng nhập
        </button>
      )}
    </header>
  );
};

export default HeaderAdmin;
