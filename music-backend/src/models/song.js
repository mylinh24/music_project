// src/models/song.js
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/configdb.js';
import artist from './artist.js';
import category from './category.js';

const song = sequelize.define('song', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    artist_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'artists',
            key: 'id',
        },
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id',
        },
    },
    release_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    listen_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    audio_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    lyrics: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    exclusive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'songs',
    timestamps: false,
});

// Define associations
song.belongsTo(artist, { foreignKey: 'artist_id', as: 'artist' });
song.belongsTo(category, { foreignKey: 'category_id', as: 'category' });

export default song;