'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '../../../utils/apiClient';
import { useRouter } from 'next/navigation';
import RevenueChart from '../../../components/RevenueChart';
import VipPurchasesTable from '../../../components/VipPurchasesTable';
import TopPackagesChart from '../../../components/TopPackagesChart';

import io from 'socket.io-client';

interface Stats {
  users: number;
  songs: number;
  artists: number;
  comments: number;
  totalRevenue: number;
  newCustomers: number;
}

interface VipPurchase {
  id: number;
  paymentDate: Date | null;
  amount: number;
  pointsUsed: number;
  vipPackage: {
    id: number;
    name: string;
    price: number;
  };
}

interface NewCustomers {
  count: number;
  customers: Array<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  }>;
}

interface TopPackage {
  vippackage_id: number;
  purchaseCount: number;
  totalRevenue: number;
  name: string;
  price: number;
}

interface ContributionStats {
  totalPoints: number;
  pointsList: Array<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    contributionPoints: number;
  }>;
}

const AdminDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [vipPurchases, setVipPurchases] = useState<VipPurchase[]>([]);
  const [newCustomers, setNewCustomers] = useState<NewCustomers>({ count: 0, customers: [] });
  const [topPackages, setTopPackages] = useState<TopPackage[]>([]);
  const [contributionStats, setContributionStats] = useState<ContributionStats>({ totalPoints: 0, pointsList: [] });
  const [purchasesOffset, setPurchasesOffset] = useState(0);
  const [hasMorePurchases, setHasMorePurchases] = useState(true);
  const [monthlyRevenue, setMonthlyRevenue] = useState({ labels: [], values: [] });
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ type: string; message: string }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const [
          statsRes,
          purchasesRes,
          newCustRes,
          topPkgRes,
          contributionRes,
          monthlyRevRes
        ] = await Promise.all([
          apiClient.get('/admin/stats'),
          apiClient.get('/admin/stats/vip-purchases?limit=10&offset=0'),
          apiClient.get('/admin/stats/new-customers'),
          apiClient.get('/admin/stats/top-packages'),
          apiClient.get('/admin/stats/contribution-points'),
          apiClient.get('/admin/stats/monthly-revenue'),
        ]);
        setStats(statsRes.data);
        setVipPurchases(purchasesRes.data);
        setNewCustomers(newCustRes.data);
        setTopPackages(topPkgRes.data);
        setContributionStats(contributionRes.data);
        setMonthlyRevenue(monthlyRevRes.data);
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        setError(error.message || 'Failed to fetch stats');
      }
    };
    fetchStats();
  }, [router]);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socket.on('message', (data) => {
      try {
        const parsed = JSON.parse(data);
        setNotifications(prev => [parsed, ...prev]);
        // Play notification sound
        const audio = new Audio('/noti.mp3');
        audio.play().catch(e => console.error('Error playing notification sound:', e));
      } catch (e) {
        console.error('Error parsing notification:', e);
      }
    });
    return () => { socket.disconnect(); };
  }, []);

  const handleLoadMorePurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      const newOffset = purchasesOffset + 10;
      const response = await apiClient.get(`http://localhost:3001/admin/stats/vip-purchases?limit=10&offset=${newOffset}`);
      if (response.data.length < 10) {
        setHasMorePurchases(false);
      }
      setVipPurchases([...vipPurchases, ...response.data]);
      setPurchasesOffset(newOffset);
    } catch (error) {
      console.error('Error loading more purchases:', error);
    }
  };

  if (!stats) return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>;

  if (error) return <div className="min-h-screen bg-gray-900 text-white p-8">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Link href="/admin/users" className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-200 block">
            <h2 className="text-xl font-semibold mb-2">Users</h2>
            <p className="text-3xl font-bold text-blue-400">{stats.users}</p>
          </Link>
          <Link href="/admin/songs" className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-200 block">
            <h2 className="text-xl font-semibold mb-2">Songs</h2>
            <p className="text-3xl font-bold text-green-400">{stats.songs}</p>
          </Link>
          <Link href="/admin/artists" className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-200 block">
            <h2 className="text-xl font-semibold mb-2">Artists</h2>
            <p className="text-3xl font-bold text-purple-400">{stats.artists}</p>
          </Link>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-200">
            <h2 className="text-xl font-semibold mb-2">Comments</h2>
            <p className="text-3xl font-bold text-red-400">{stats.comments}</p>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Notifications</h2>
          <div className="bg-gray-800 p-4 rounded-lg max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-400">No notifications yet.</p>
            ) : (
              notifications.map((notif, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-700 rounded">
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Thống kê</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className={`bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-200 ${activeSection === 'revenue' ? 'ring-2 ring-yellow-400' : 'hover:bg-gray-700'}`} onClick={() => setActiveSection('revenue')}>
              <h3 className="text-xl font-semibold mb-2">Tổng doanh thu</h3>
              <p className="text-3xl font-bold text-yellow-400">{stats.totalRevenue || 0} VND</p>
            </div>
            <div className={`bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-200 ${activeSection === 'customers' ? 'ring-2 ring-cyan-400' : 'hover:bg-gray-700'}`} onClick={() => setActiveSection('customers')}>
              <h3 className="text-xl font-semibold mb-2">Khách hàng mới (30 ngày)</h3>
              <p className="text-3xl font-bold text-cyan-400">{newCustomers.count}</p>
            </div>
            <div className={`bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-200 ${activeSection === 'points' ? 'ring-2 ring-pink-400' : 'hover:bg-gray-700'}`} onClick={() => setActiveSection('points')}>
              <h3 className="text-xl font-semibold mb-2">Tổng tích điểm</h3>
              <p className="text-3xl font-bold text-pink-400">{contributionStats.totalPoints} điểm</p>
            </div>
            <div className={`bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-200 ${activeSection === 'vip' ? 'ring-2 ring-green-400' : 'hover:bg-gray-700'}`} onClick={() => setActiveSection('vip')}>
              <h3 className="text-xl font-semibold mb-2">VIP</h3>
              <p className="text-3xl font-bold text-green-400">{vipPurchases.length}</p>
            </div>
          </div>

          {activeSection === 'revenue' && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Doanh thu theo tháng</h3>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <RevenueChart data={monthlyRevenue} />
              </div>
            </div>
          )}

          {activeSection === 'customers' && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Danh sách khách hàng mới (30 ngày)</h3>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Tên</th>
                      <th className="px-4 py-2">Ngày đăng ký</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newCustomers.customers.map((user) => (
                      <tr key={user.id} className="border-t border-gray-600">
                        <td className="px-4 py-2">{user.id}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.firstName} {user.lastName}</td>
                        <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'points' && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Danh sách tích điểm người dùng</h3>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2">ID</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Tên</th>
                      <th className="px-4 py-2">Tích điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributionStats.pointsList.slice(0, 10).map((user) => (
                      <tr key={user.id} className="border-t border-gray-600">
                        <td className="px-4 py-2">{user.id}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.firstName} {user.lastName}</td>
                        <td className="px-4 py-2">{user.contributionPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'vip' && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">VIP Purchases & Top Packages</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VipPurchasesTable purchases={vipPurchases} onLoadMore={handleLoadMorePurchases} hasMore={hasMorePurchases} />
                <TopPackagesChart data={topPackages} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
