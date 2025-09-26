import { DataTypes, Model } from 'sequelize';

class VipPackage extends Model {
    static init(sequelize) {
        super.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            duration: {
                type: DataTypes.INTEGER, // duration in days
                allowNull: false,
            },
        }, {
            sequelize,
            modelName: 'VipPackage',
            tableName: 'vip_packages',
            timestamps: false,
        });
    }

    static associate() {
        // Associations if needed
    }
}

export default VipPackage;
