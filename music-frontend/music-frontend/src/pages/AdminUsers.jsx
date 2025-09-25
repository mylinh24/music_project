import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:6969/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const updateRole = async (id, role) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:6969/api/admin/users/${id}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.map(user => user.id === id ? { ...user, role } : user));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:6969/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">First Name</th>
                <th className="p-4 text-left">Last Name</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Details</th>
                <th className="p-4 text-left">Edit</th>
                <th className="p-4 text-left">Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className={`hover:bg-gray-700 transition-colors ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
                  <td className="p-4">{user.id}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.firstName}</td>
                  <td className="p-4">{user.lastName}</td>
                  <td className="p-4">
                    <select value={user.role} onChange={(e) => updateRole(user.id, e.target.value)} className="bg-gray-600 text-white rounded px-2 py-1">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <Link to={`/profile/${user.id}`} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors">View</Link>
                  </td>
                  <td className="p-4">
                    <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors">Edit</button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => deleteUser(user.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
