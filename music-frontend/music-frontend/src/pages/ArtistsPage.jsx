import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const ArtistsPage = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axios.get('http://localhost:6969/api/artists');
        setArtists(response.data);
      } catch (err) {
        setError('Không thể tải danh sách nghệ sĩ.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-20 pb-24">
        <h1 className="text-3xl font-bold mb-8">Tất cả nghệ sĩ</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <div key={artist.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
              <img
                src={artist.image_url || 'https://via.placeholder.com/200x200?text=No+Image'}
                alt={artist.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/200x200?text=No+Image')}
              />
              <h3 className="text-lg font-semibold mb-2">
                <Link to={`/artist/${artist.id}`} className="hover:underline">
                  {artist.name}
                </Link>
              </h3>
              <p className="text-sm text-gray-500">{artist.total_listens} lượt nghe</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistsPage;
