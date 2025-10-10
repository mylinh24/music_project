'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Play } from 'lucide-react';
import { setCurrentSong, setIsPlaying, setCurrentSongList, setCurrentSongIndex } from '../../../redux/playerSlice';
import axios from 'axios';
import Link from 'next/link';
import HeaderAdmin from '../../../components/HeaderAdmin';

interface Song {
  id: number;
  title: string;
  artist: { id: number; name: string };
  category: { id: number; name: string };
  listenCount: number;
  audio_url: string;
  image_url: string;
  lyrics: string;
  release_date: string;
  exclusive: boolean;
}

const AdminSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/admin/songs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSongs(response.data);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };
    fetchSongs();
  }, []);

  const deleteSong = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/admin/songs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSongs(songs.filter(song => song.id !== id));
      setSuccess('Xóa bài hát thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  const handlePlaySong = (song: Song) => {
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
          <button onClick={() => router.push('/admin/songs/add')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">
            Add New Song
          </button>
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
                  <td className="p-4">{song.listenCount}</td>
                  <td className="p-4">
                    <button onClick={() => handlePlaySong(song)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors">
                      <Play className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/songs/${song.id}`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition-colors">
                      View
                    </Link>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/songs/${song.id}/edit`} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors">
                      Edit
                    </Link>
                  </td>
                  <td className="p-4">
                    <button onClick={() => deleteSong(song.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors">
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

export default AdminSongs;
