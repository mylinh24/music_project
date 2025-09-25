import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/configdb.js';

const VipPurchase = sequelize.define('VipPurchase', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    points_used: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'vip_purchases',
    timestamps: false,
});

export default VipPurchase;