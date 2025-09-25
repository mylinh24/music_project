import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { setCurrentSong, setIsPlaying, setCurrentSongList, setCurrentSongIndex } from '../redux/playerSlice';
import axios from 'axios';

const AdminSongs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:6969/api/admin/songs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSongs(response.data);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };
    fetchSongs();
  }, []);

  const deleteSong = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:6969/api/admin/songs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSongs(songs.filter(song => song.id !== id));
      setSuccess('Xóa bài hát thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  const handlePlaySong = (song) => {
    dispatch(setCurrentSong(song));
    dispatch(setCurrentSongList(songs));
    dispatch(setCurrentSongIndex(songs.findIndex(s => s.id === song.id)));
    dispatch(setIsPlaying(true));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Songs</h1>
          <button onClick={() => navigate('/admin/add-song')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">Add New Song</button>
        </div>
        {success && (
          <div className="mb-4 p-4 bg-green-600 text-white rounded-lg">
            {success}
          </div>
        )}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Artist</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Listen Count</th>
              <th className="p-4 text-left">Play</th>
              <th className="p-4 text-left">View</th>
              <th className="p-4 text-left">Edit</th>
              <th className="p-4 text-left">Delete</th>
            </tr>
            </thead>
            <tbody>
              {songs.map((song, index) => (
                <tr key={song.id} className={`hover:bg-gray-700 transition-colors ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
                  <td className="p-4">{song.id}</td>
                  <td className="p-4">{song.title}</td>
                  <td className="p-4">{song.artist?.name}</td>
                  <td className="p-4">{song.category?.name}</td>
                  <td className="p-4">{song.listen_count}</td>
                  <td className="p-4">
                    <button onClick={() => handlePlaySong(song)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="p-4">
                    <Link to={`/admin/song/${song.id}`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition-colors">View</Link>
                  </td>
                  <td className="p-4">
                    <Link to={`/admin/edit-song/${song.id}`} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors inline-block">Edit</Link>
                  </td>
                  <td className="p-4">
                    <button onClick={() => deleteSong(song.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors">Delete</button>
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

export default AdminSongs;
