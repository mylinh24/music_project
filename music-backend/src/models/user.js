//src/models/user.js
import { DataTypes, Model } from 'sequelize';

class User extends Model {
    static init(sequelize) {
        super.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING,
            isVerified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            avatar: {
                type: DataTypes.BLOB('long'), // lưu dữ liệu nhị phân (ảnh, file)
                allowNull: true,
            },
            vip: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        }, {
            sequelize,
            modelName: 'User',
        });
    }

    static associate() {
        // Associations if needed
    }
}

export default User;