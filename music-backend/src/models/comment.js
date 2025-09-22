import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/configdb.js';

const Comment = sequelize.define('comment', {
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
    song_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'songs',
            key: 'id',
        },
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Associations will be defined in index.js to avoid circular dependencies
export default Comment;
