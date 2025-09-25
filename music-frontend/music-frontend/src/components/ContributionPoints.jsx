import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Trophy, Users, Gift } from 'lucide-react';

const ContributionPoints = () => {
    const [referralData, setReferralData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, token } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchReferralData();
        }
    }, [isAuthenticated, token]);

    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                'http://localhost:6969/api/referral/stats',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setReferralData(response.data);
        } catch (error) {
            console.error('Error fetching referral data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankName = (points) => {
        if (points >= 1000) return 'Legend';
        if (points >= 500) return 'Master';
        if (points >= 200) return 'Expert';
        if (points >= 100) return 'Advanced';
        if (points >= 50) return 'Intermediate';
        return 'Beginner';
    };

    const getRankColor = (points) => {
        if (points >= 1000) return 'text-purple-400';
        if (points >= 500) return 'text-red-400';
        if (points >= 200) return 'text-orange-400';
        if (points >= 100) return 'text-yellow-400';
        if (points >= 50) return 'text-blue-400';
        return 'text-gray-400';
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 h-full">
                <h3 className="text-xl font-bold text-white mb-4">Điểm giới thiệu</h3>
                <p className="text-gray-400">Vui lòng đăng nhập để xem điểm giới thiệu</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 h-full">
                <h3 className="text-xl font-bold text-white mb-4">Điểm giới thiệu</h3>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    const totalPoints = referralData?.total_points || 0;
    const referralCount = referralData?.referral_count || 0;
    const rankName = getRankName(totalPoints);
    const rankColor = getRankColor(totalPoints);

    return (
        <div className="bg-gray-800 rounded-lg p-6 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Điểm giới thiệu</h3>
                <Gift className="w-6 h-6 text-green-400" />
            </div>

            <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">
                    {totalPoints.toLocaleString()}
                </div>
                <div className={`text-lg font-medium ${rankColor}`}>
                    {rankName}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                    Tổng điểm từ giới thiệu
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Số lượt giới thiệu:</span>
                    <span className="text-white font-medium">{referralCount}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Cấp độ tiếp theo:</span>
                    <span className="text-white font-medium">
                        {rankName === 'Legend' ? 'Max Level' : `${getNextLevelPoints(totalPoints)} điểm`}
                    </span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((totalPoints % 100) / 100 * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            <div className="mt-4 p-3 bg-green-900/30 rounded-lg">
                <div className="text-sm text-green-300">
                    💰 <strong>Mẹo:</strong> Mỗi lượt giới thiệu thành công sẽ mang lại 50 điểm!
                </div>
            </div>

            <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
                <div className="text-sm text-blue-300">
                    👥 <strong>Chia sẻ:</strong> Giới thiệu bạn bè để cùng nhận thưởng!
                </div>
            </div>
        </div>
    );
};

// Helper function to get next level points
const getNextLevelPoints = (currentPoints) => {
    if (currentPoints >= 1000) return 0; // Max level
    if (currentPoints >= 500) return 1000;
    if (currentPoints >= 200) return 500;
    if (currentPoints >= 100) return 200;
    if (currentPoints >= 50) return 100;
    return 50;
};

export default ContributionPoints;
