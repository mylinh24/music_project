// models/category.js
import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/configdb.js';

const category = sequelize.define('category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    tableName: 'categories',
    timestamps: false,
});

export default category;