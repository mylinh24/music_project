'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Play, Pause } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentSong, setIsPlaying, setCurrentSongList, setCurrentSongIndex } from '../../../../redux/playerSlice';

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
  artist_songs?: Song[];
}

const AdminSongDetail = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentSong, isPlaying } = useSelector((state: any) => state.player);
  const [songData, setSongData] = useState<Song | null>(null);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3001/admin/songs/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSongData(response.data);
        const artistId = response.data.artist.id;
        const songsRes = await axios.get(`http://localhost:3001/admin/songs?artist_id=${artistId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const otherSongs = songsRes.data.filter((s: Song) => s.id !== response.data.id);
        setArtistSongs(otherSongs);
        dispatch(setCurrentSongList(otherSongs));
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch song detail:', err);
        setError('Không thể tải chi tiết bài hát. Vui lòng thử lại.');
        setLoading(false);
      }
    };
    if (params.id) {
      fetchSongDetail();
    }
  }, [params.id, dispatch]);

  const handlePlayPause = () => {
    if (!songData?.audio_url) {
      setError('Không tìm thấy URL âm thanh.');
      return;
    }
    if (currentSong?.id === songData.id) {
      dispatch(setIsPlaying(!isPlaying));
    } else {
      dispatch(setCurrentSong(songData));
      dispatch(setCurrentSongList(artistSongs));
      dispatch(setCurrentSongIndex(artistSongs.findIndex((s: Song) => s.id === songData.id) || 0));
      dispatch(setIsPlaying(true));
    }
  };

  const handleSongPlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      dispatch(setIsPlaying(!isPlaying));
    } else {
      dispatch(setCurrentSong(song));
      dispatch(setCurrentSongList(artistSongs));
      dispatch(setCurrentSongIndex(artistSongs.findIndex((s: Song) => s.id === song.id) || 0));
      dispatch(setIsPlaying(true));
    }
  };

  const isValidImageUrl = (url: string) => {
    return url && !url.startsWith('C:') && url.match(/\.(jpeg|jpg|png|gif)$/i);
  };

  if (loading) return <p className="text-center text-gray-400">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => router.push('/admin/songs')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
          >
            ← Quay lại danh sách bài hát
          </button>
          <div className="space-x-2">
            <button
              onClick={() => router.push(`/admin/songs/${songData?.id}/edit`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Chỉnh Sửa
            </button>
            <button
              onClick={async () => {
                if (confirm('Bạn có chắc muốn xóa bài hát này không?')) {
                  try {
                    const token = localStorage.getItem('token');
                    await fetch(`http://localhost:3001/admin/songs/${songData?.id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    alert('Xóa bài hát thành công');
                    router.push('/admin/songs');
                  } catch (error) {
                    alert('Xóa bài hát thất bại');
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>
        {songData && (
          <>
            <div className="mb-8 text-center">
              <div className="relative inline-block">
                <img
                  src={isValidImageUrl(songData.image_url) ? songData.image_url : 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={songData.title}
                  className="w-64 h-64 object-cover rounded-lg mx-auto mb-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
              </div>
              <h1 className="text-4xl font-bold">{songData.title}</h1>
              <p className="text-xl text-gray-400">{songData.artist.name}</p>
              <p className="text-gray-500">Lượt nghe: {songData.listenCount}</p>
              <p className="text-gray-500">Thể loại: {songData.category.name}</p>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 flex items-center"
                  onClick={handlePlayPause}
                >
                  {currentSong?.id === songData.id && isPlaying ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                  {currentSong?.id === songData.id && isPlaying ? 'Tạm dừng' : 'Phát'}
                </button>
              </div>
            </div>
            {songData.lyrics && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Lời bài hát</h2>
                <div className="bg-gray-800 p-6 rounded-lg whitespace-pre-line">
                  {songData.lyrics}
                </div>
              </div>
            )}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Bài hát khác của {songData.artist.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {artistSongs.map((song) => (
                  <div key={song.id} className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => router.push(`/admin/songs/${song.id}`)}>
                    <img
                      src={isValidImageUrl(song.image_url) ? song.image_url : 'https://via.placeholder.com/150x150?text=No+Image'}
                      alt={song.title}
                      className="w-full h-32 object-cover rounded mb-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                      }}
                    />
                    <h3 className="font-semibold">{song.title}</h3>
                    <p className="text-gray-400 text-sm">{song.artist?.name}</p>
                    <p className="text-gray-500 text-sm">Lượt nghe: {song.listenCount}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSongDetail;
