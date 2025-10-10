'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface Artist {
  id: number;
  name: string;
  image_url: string;
  totalListens: number;
}

const AdminArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/admin/artists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setArtists(response.data);
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };
    fetchArtists();
  }, []);

  const deleteArtist = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/admin/artists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArtists(artists.filter(artist => artist.id !== id));
      setSuccess('Xóa nghệ sĩ thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting artist:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Artists</h1>
          <Link href="/admin/artists/add" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">
            Add New Artist
          </Link>
        </div>
        {success && (
          <div className="mb-4 p-4 bg-green-600 text-white rounded-lg">
            {success}
          </div>
        )}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Image</th>
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
                  <td className="p-4">
                    {artist.image_url && (
                      <img src={artist.image_url} alt={artist.name} className="w-12 h-12 rounded" />
                    )}
                  </td>
                  <td className="p-4">{artist.totalListens}</td>
                  <td className="p-4">
                    <Link href={`/admin/artists/${artist.id}`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition-colors">
                      View
                    </Link>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/artists/${artist.id}/edit`} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors">
                      Edit
                    </Link>
                  </td>
                  <td className="p-4">
                    <button onClick={() => deleteArtist(artist.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors">
                      Delete
                    </button>
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
