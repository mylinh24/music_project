import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminArtists = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:6969/api/admin/artists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArtists(response.data);
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };
    fetchArtists();
  }, []);

  const deleteArtist = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:6969/api/admin/artists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArtists(artists.filter(artist => artist.id !== id));
      setSuccess('Xóa nghệ sĩ thành công!');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (error) {
      console.error('Error deleting artist:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
        setTimeout(() => setError(''), 5000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Artists</h1>
          <button onClick={() => navigate('/admin/add-artist')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">Add New Artist</button>
        </div>
        {error && (
          <div className="mb-4 p-4 bg-red-600 text-white rounded-lg">
            {error}
          </div>
        )}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Total Listens</th>
                <th className="p-4 text-left">View</th>
                <th className="p-4 text-left">Edit</th>
                <th className="p-4 text-left">Delete</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist, index) => (
                <tr key={artist.id} className={`hover:bg-gray-700 transition-colors ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
                  <td className="p-4">{artist.id}</td>
                  <td className="p-4">{artist.name}</td>
                  <td className="p-4">{artist.total_listens}</td>
                  <td className="p-4">
                    <Link to={`/admin/artist/${artist.id}`} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors">View</Link>
                  </td>
                  <td className="p-4">
                    <Link to={`/admin/edit-artist/${artist.id}`} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors inline-block">Edit</Link>
                  </td>
                  <td className="p-4">
                    <button onClick={() => deleteArtist(artist.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors">Delete</button>
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

export default AdminArtists;
