import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/configdb.js';
import song from './song.js';
import User from './user.js';

const listenHistory = sequelize.define('listen_history', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    song_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'songs',
            key: 'id',
        },
    },
    listened_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
}, {
    tableName: 'listen_history',
    timestamps: false,
});

// Define associations
listenHistory.belongsTo(song, { foreignKey: 'song_id', as: 'song' });
listenHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default listenHistory;