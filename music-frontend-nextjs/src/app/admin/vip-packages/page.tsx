'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface VipPackage {
    id: number;
    name: string;
    price: number;
    duration: number;
}

export default function AdminVipPackages() {
    const [packages, setPackages] = useState<VipPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingPackage, setEditingPackage] = useState<VipPackage | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration: ''
    });
    const router = useRouter();

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/admin/vip-packages', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPackages(response.data);
        } catch (error) {
            console.error('Error fetching VIP packages:', error);
            setError('Không thể tải danh sách gói VIP');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const resetForm = () => {
        setFormData({ name: '', price: '', duration: '' });
        setEditingPackage(null);
        setShowCreateForm(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3001/admin/vip-packages', {
                name: formData.name,
                price: parseInt(formData.price),
                duration: parseInt(formData.duration)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            resetForm();
            fetchPackages();
        } catch (error) {
            console.error('Error creating VIP package:', error);
            setError('Không thể tạo gói VIP');
        }
    };

    const handleEdit = (pkg: VipPackage) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            price: pkg.price.toString(),
            duration: pkg.duration.toString()
        });
        setShowCreateForm(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPackage) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3001/admin/vip-packages/${editingPackage.id}`, {
                name: formData.name,
                price: parseInt(formData.price),
                duration: parseInt(formData.duration)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            resetForm();
            fetchPackages();
        } catch (error) {
            console.error('Error updating VIP package:', error);
            setError('Không thể cập nhật gói VIP');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa gói VIP này?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3001/admin/vip-packages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchPackages();
        } catch (error) {
            console.error('Error deleting VIP package:', error);
            setError('Không thể xóa gói VIP');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
                <div className="text-xl">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8 pt-20 pb-24">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Quản lý gói VIP</h1>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                    >
                        {showCreateForm ? 'Hủy' : 'Thêm gói VIP'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {showCreateForm && (
                    <div className="bg-gray-800 p-6 rounded-lg mb-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editingPackage ? 'Chỉnh sửa gói VIP' : 'Thêm gói VIP mới'}
                        </h2>
                        <form onSubmit={editingPackage ? handleUpdate : handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Tên gói</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Giá (VNĐ)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Thời hạn (ngày)</label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
                                >
                                    {editingPackage ? 'Cập nhật' : 'Tạo'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 w-16">ID</th>
                                    <th className="px-4 py-3">Tên gói</th>
                                    <th className="px-4 py-3">Giá (VNĐ)</th>
                                    <th className="px-4 py-3">Thời hạn (ngày)</th>
                                    <th className="px-4 py-3 w-48">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.map((pkg) => (
                                    <tr key={pkg.id} className="border-t border-gray-600 hover:bg-gray-700">
                                        <td className="px-4 py-3">{pkg.id}</td>
                                        <td className="px-4 py-3 font-medium">{pkg.name}</td>
                                        <td className="px-4 py-3">{pkg.price.toLocaleString('vi-VN')} VNĐ</td>
                                        <td className="px-4 py-3">{pkg.duration} ngày</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(pkg)}
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pkg.id)}
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {packages.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        Chưa có gói VIP nào
                    </div>
                )}
            </div>
        </div>
    );
}
