import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/configdb.js';

const UserContribution = sequelize.define('userContribution', {
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
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    reason: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'user_contributions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

// Associations will be defined in index.js to avoid circular dependencies
export default UserContribution;
