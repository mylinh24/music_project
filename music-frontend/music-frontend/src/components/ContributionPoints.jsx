import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Trophy, Star } from 'lucide-react';

const ContributionPoints = () => {
    const [contributionData, setContributionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, token } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchContributionData();
        }
    }, [isAuthenticated, token]);

    const fetchContributionData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                'http://localhost:6969/api/comments/contributions/points',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setContributionData(response.data);
        } catch (error) {
            console.error('Error fetching contribution data:', error);
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
                <h3 className="text-xl font-bold text-white mb-4">Điểm đóng góp</h3>
                <p className="text-gray-400">Vui lòng đăng nhập để xem điểm đóng góp</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 h-full">
                <h3 className="text-xl font-bold text-white mb-4">Điểm đóng góp</h3>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    const totalPoints = contributionData?.total_points || 0;
    const rankName = getRankName(totalPoints);
    const rankColor = getRankColor(totalPoints);

    return (
        <div className="bg-gray-800 rounded-lg p-6 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Điểm đóng góp</h3>
                <Trophy className="w-6 h-6 text-yellow-400" />
            </div>

            <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">
                    {totalPoints.toLocaleString()}
                </div>
                <div className={`text-lg font-medium ${rankColor}`}>
                    {rankName}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                    Tổng điểm tích lũy
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Cấp độ tiếp theo:</span>
                    <span className="text-white font-medium">
                        {rankName === 'Legend' ? 'Max Level' : `${getNextLevelPoints(totalPoints)} điểm`}
                    </span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((totalPoints % 100) / 100 * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            {contributionData?.recent_contributions && contributionData.recent_contributions.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-lg font-medium text-white mb-3">Hoạt động gần đây</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {contributionData.recent_contributions.map((contribution, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-gray-300">{contribution.reason}</span>
                                </div>
                                <span className="text-green-400">+{contribution.points}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
                <div className="text-sm text-blue-300">
                    💡 <strong>Mẹo:</strong> Mỗi bình luận và đánh giá sẽ mang lại 10 điểm đóng góp!
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
