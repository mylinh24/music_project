// models/artist.js
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/configdb.js';

const artist = sequelize.define('artist', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    total_listens: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'artists',
    timestamps: false,
});

export default artist;