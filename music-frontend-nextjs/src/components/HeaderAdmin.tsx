'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DEFAULT_AVATAR =
  'https://res.cloudinary.com/di1eiccl8/image/upload/v1757750263/js1gl8rqTcqd6_yWH0qzMw_j0f0cl.webp';

const HeaderAdmin = () => {
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

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem('token'); // Xóa token
    router.push('/admin/login'); // Redirect về trang login
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
      <div className="relative" ref={menuRef}>
        <div className="flex items-center gap-2">
          <span className="text-red-400 font-semibold">Admin Panel</span>
          <img
            src={DEFAULT_AVATAR}
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
            Admin
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-[100px] w-48 bg-red-800 rounded-lg shadow-lg z-10">
              <Link
                href="/profile"
                className="block px-4 py-2 text-white hover:bg-red-700"
                onClick={() => setMenuOpen(false)}
              >
                Hồ sơ
              </Link>
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
    </header>
  );
};

export default HeaderAdmin;
