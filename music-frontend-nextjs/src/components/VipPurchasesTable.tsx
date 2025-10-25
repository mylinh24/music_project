'use client';

import React from 'react';

interface VipPurchase {
  id: number;
  payment_date: Date | null;
  amount: number;
  points_used: number;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  vipPackage: {
    id: number;
    name: string;
    price: number;
  };
}

interface VipPurchasesTableProps {
  purchases: VipPurchase[];
  onLoadMore: () => void;
  hasMore: boolean;
}

const VipPurchasesTable: React.FC<VipPurchasesTableProps> = ({ purchases, onLoadMore, hasMore }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-white">Danh sách mua VIP</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 text-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Người dùng</th>
              <th className="py-2 px-4 border-b">Gói VIP</th>
              <th className="py-2 px-4 border-b">Số tiền</th>
              <th className="py-2 px-4 border-b">Ngày thanh toán</th>
              <th className="py-2 px-4 border-b">Điểm sử dụng</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-gray-600">
                <td className="py-2 px-4 border-b">{purchase.id}</td>
                <td className="py-2 px-4 border-b">
                  {purchase.user ? `${purchase.user.firstName} ${purchase.user.lastName} (${purchase.user.email})` : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">
                  {purchase.vipPackage?.name || 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">{purchase.amount} VND</td>
                <td className="py-2 px-4 border-b">
                  {purchase.payment_date ? new Date(purchase.payment_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="py-2 px-4 border-b">{purchase.points_used}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <button
          onClick={onLoadMore}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Tải thêm
        </button>
      )}
    </div>
  );
};

export default VipPurchasesTable;
