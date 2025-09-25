import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:6969/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
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
      </div>
    </div>
  );
};

export default AdminDashboard;
