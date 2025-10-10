'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface Artist {
  id: number;
  name: string;
  image_url: string;
  totalListens: number;
}

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

const DEFAULT_ARTIST_IMAGE = 'https://via.placeholder.com/300x300?text=Artist';

const AdminArtistDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const [artistRes, songsRes] = await Promise.all([
          axios.get(`http://localhost:3001/admin/artists/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:3001/admin/songs?artist_id=${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setArtist(artistRes.data);
        setSongs(songsRes.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const deleteSong = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài hát này?')) return;
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

  const deleteArtist = async () => {
    if (!artist) return;
    if (!confirm('Bạn có chắc chắn muốn xóa nghệ sĩ này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/admin/artists/${artist.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Xóa nghệ sĩ thành công!');
      setTimeout(() => {
        setSuccess('');
        router.push('/admin/artists');
      }, 3000);
    } catch (error) {
      console.error('Error deleting artist:', error);
    }
  };

  const isValidImageUrl = (url: string) => {
    return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
  };

  if (error) return <div className="min-h-screen bg-gray-900 text-white p-8">Error: {error}</div>;
  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-8">Loading...</div>;
  if (!artist) return <div className="min-h-screen bg-gray-900 text-white p-8">Artist not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Chi Tiết Nghệ Sĩ</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/admin/artists/${artist.id}/edit`)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              Chỉnh Sửa Nghệ Sĩ
            </button>
            <button
              onClick={deleteArtist}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Xóa Nghệ Sĩ
            </button>
          </div>
        </div>
        {success && (
          <div className="mb-4 p-4 bg-green-600 text-white rounded-lg">
            {success}
          </div>
        )}

        {/* Thông tin nghệ sĩ */}
        <div className="flex flex-col items-center gap-6 mb-12 justify-center">
          <img
            src={
              isValidImageUrl(artist.image_url)
                ? artist.image_url
                : DEFAULT_ARTIST_IMAGE
            }
            alt={artist.name}
            className="w-48 h-48 rounded-full object-cover"
            onError={(e) => (e.target as HTMLImageElement).src = DEFAULT_ARTIST_IMAGE}
          />
          <div>
            <h2 className="text-3xl font-bold">{artist.name}</h2>
            {artist.totalListens > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Tổng lượt nghe: {artist.totalListens.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Danh sách bài hát */}
        {songs.length > 0 ? (
          <section className="mb-12">
            <h3 className="text-2xl font-bold mb-4">Danh Sách Bài Hát</h3>
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-4 text-left">ID</th>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-left">Listen Count</th>
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
                      <td className="p-4">{song.category?.name}</td>
                      <td className="p-4">{song.listenCount}</td>
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
          </section>
        ) : (
          <p className="text-center text-gray-400">
            Không có bài hát nào của nghệ sĩ này.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminArtistDetail;
