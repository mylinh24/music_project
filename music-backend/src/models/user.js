import { DataTypes } from 'sequelize';
import { sequelize } from '../config/configdb.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    avatar: {
        type: DataTypes.BLOB('long'),
        allowNull: true,
    },
}, {
    tableName: 'users',
    timestamps: true, // Bật timestamps để tự động quản lý createdAt và updatedAt
});

export default User;