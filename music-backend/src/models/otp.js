import { DataTypes } from 'sequelize';
import { sequelize } from '../config/configdb.js';

const OTP = sequelize.define('OTP', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'OTPs',
    timestamps: true, // Bật timestamps để tự động quản lý createdAt và updatedAt
});

export default OTP;