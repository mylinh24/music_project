import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminVipPackages = () => {
    const [packages, setPackages] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration: ''
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:6969/api/admin/vip-packages', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPackages(response.data);
        } catch (error) {
            console.error('Error fetching VIP packages:', error);
            alert('Error fetching VIP packages: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = {
                name: formData.name,
                price: parseInt(formData.price),
                duration: parseInt(formData.duration)
            };

            if (editingPackage) {
                await axios.put(`http://localhost:6969/api/admin/vip-packages/${editingPackage.id}`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post('http://localhost:6969/api/admin/vip-packages', data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            fetchPackages();
            setShowForm(false);
            setEditingPackage(null);
            setFormData({ name: '', price: '', duration: '' });
        } catch (error) {
            console.error('Error saving VIP package:', error);
            alert('Error saving VIP package: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            price: pkg.price.toString(),
            duration: pkg.duration.toString()
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this VIP package?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:6969/api/admin/vip-packages/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchPackages();
            } catch (error) {
                console.error('Error deleting VIP package:', error);
                alert('Error deleting VIP package: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingPackage(null);
        setFormData({ name: '', price: '', duration: '' });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8 pt-20 pb-24">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Manage VIP Packages</h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                    >
                        Add New Package
                    </button>
                </div>

                {showForm && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editingPackage ? 'Edit VIP Package' : 'Add New VIP Package'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded px-3 py-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Price (VND)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded px-3 py-2"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Duration (days)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded px-3 py-2"
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                                >
                                    {editingPackage ? 'Update' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="p-4 text-left">ID</th>
                                <th className="p-4 text-left">Name</th>
                                <th className="p-4 text-left">Price</th>
                                <th className="p-4 text-left">Duration</th>
                                <th className="p-4 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.map((pkg, index) => (
                                <tr key={pkg.id} className={`hover:bg-gray-700 transition-colors ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}>
                                    <td className="p-4">{pkg.id}</td>
                                    <td className="p-4">{pkg.name}</td>
                                    <td className="p-4">{pkg.price.toLocaleString()} VND</td>
                                    <td className="p-4">{pkg.duration} days</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(pkg)}
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pkg.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
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

export default AdminVipPackages;
