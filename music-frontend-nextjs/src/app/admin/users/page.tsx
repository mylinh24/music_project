'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const updateRole = async (id: number, role: 'user' | 'admin') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/admin/users/${id}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.map(user => user.id === id ? { ...user, role } : user));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">First Name</th>
              <th className="p-4 text-left">Last Name</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-600">
                <td className="p-4">{user.id}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.firstName}</td>
                <td className="p-4">{user.lastName}</td>
                <td className="p-4">
                  <select value={user.role} onChange={(e) => updateRole(user.id, e.target.value as 'user' | 'admin')} className="bg-gray-600 text-white rounded px-2 py-1">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4">
                  <button onClick={() => router.push(`/admin/users/${user.id}`)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded mr-2">View</button>
                  <button onClick={() => router.push(`/admin/users/${user.id}/edit`)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded mr-2">Edit</button>
                  <button onClick={() => deleteUser(user.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
