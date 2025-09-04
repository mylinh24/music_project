<<<<<<< HEAD
=======
//src/models/user.js
>>>>>>> 14f427b2 (second commit)
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
                unique: true,
                allowNull: false,
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
<<<<<<< HEAD
=======
            avatar: {
                type: DataTypes.BLOB('long'), // lưu dữ liệu nhị phân (ảnh, file)
                allowNull: true,
            },
>>>>>>> 14f427b2 (second commit)
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