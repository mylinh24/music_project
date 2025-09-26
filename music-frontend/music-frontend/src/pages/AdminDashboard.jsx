import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import RevenueChart from '../components/RevenueChart';
import VipPurchasesTable from '../components/VipPurchasesTable';
import TopPackagesChart from '../components/TopPackagesChart';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [vipPurchases, setVipPurchases] = useState([]);
  const [newCustomers, setNewCustomers] = useState({ count: 0, customers: [] });
        const [topPackages, setTopPackages] = useState([]);
        const [contributionStats, setContributionStats] = useState({ totalPoints: 0, pointsList: [] });
        const [purchasesOffset, setPurchasesOffset] = useState(0);
  const [hasMorePurchases, setHasMorePurchases] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [statsRes, purchasesRes, newCustRes, topPkgRes, contributionRes] = await Promise.all([
          axios.get('http://localhost:6969/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:6969/api/admin/stats/vip-purchases?limit=10&offset=0', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:6969/api/admin/stats/new-customers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:6969/api/admin/stats/top-packages', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:6969/api/admin/stats/contribution-points', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStats(statsRes.data);
        setVipPurchases(purchasesRes.data);
        setNewCustomers(newCustRes.data);
        setTopPackages(topPkgRes.data);
        setContributionStats(contributionRes.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link to="/admin/users" className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-200 block">
            <h2 className="text-xl font-semibold mb-2">Users</h2>
            <p className="text-3xl font-bold text-blue-400">{stats.users}</p>
          </Link>
          <Link to="/admin/songs" className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-200 block">
            <h2 className="text-xl font-semibold mb-2">Songs</h2>
            <p className="text-3xl font-bold text-green-400">{stats.songs}</p>
          </Link>
          <Link to="/admin/artists" className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-200 block">
            <h2 className="text-xl font-semibold mb-2">Artists</h2>
            <p className="text-3xl font-bold text-purple-400">{stats.artists}</p>
          </Link>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-200">
            <h2 className="text-xl font-semibold mb-2">Comments</h2>
            <p className="text-3xl font-bold text-red-400">{stats.comments}</p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/users" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors">Manage Users</Link>
            <Link to="/admin/songs" className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors">Manage Songs</Link>
            <Link to="/admin/artists" className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors">Manage Artists</Link>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Thống kê</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Tổng doanh thu</h3>
              <p className="text-3xl font-bold text-yellow-400">{stats.totalRevenue || 0} VND</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Khách hàng mới (30 ngày)</h3>
              <p className="text-3xl font-bold text-cyan-400">{newCustomers.count}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Tổng tích điểm</h3>
              <p className="text-3xl font-bold text-pink-400">{contributionStats.totalPoints} điểm</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <VipPurchasesTable purchases={vipPurchases} onLoadMore={() => {}} hasMore={hasMorePurchases} />
            <TopPackagesChart data={topPackages} />
          </div>
          <div className="mt-6">
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
                      <td className="px-4 py-2">{user.contribution_points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
