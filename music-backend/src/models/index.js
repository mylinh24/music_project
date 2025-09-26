import { sequelize } from '../config/configdb.js';
import User from './user.js';
import OTP from './otp.js';
import Song from './song.js';
import Artist from './artist.js';
import Category from './category.js';
import Favorite from './favorites.js';
import Comment from './comment.js';
import UserContribution from './userContribution.js';
import VipPurchase from './vipPurchase.js';
import VipPackage from './vipPackage.js';

// Initialize models
User.init(sequelize);
OTP.init(sequelize);
VipPackage.init(sequelize);

// Define associations
Song.hasMany(Favorite, { foreignKey: 'song_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });
Favorite.belongsTo(Song, { foreignKey: 'song_id' });

User.hasMany(OTP, { foreignKey: 'userId' });
Song.hasMany(Comment, { foreignKey: 'song_id' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Comment.belongsTo(Song, { foreignKey: 'song_id', as: 'song' });
User.hasMany(UserContribution, { foreignKey: 'user_id' });
UserContribution.belongsTo(User, { foreignKey: 'user_id' });

// Add VipPurchase association
User.hasMany(VipPurchase, { foreignKey: 'user_id' });
VipPurchase.belongsTo(User, { foreignKey: 'user_id' });
VipPackage.hasMany(VipPurchase, { foreignKey: 'vippackage_id' });
VipPurchase.belongsTo(VipPackage, { foreignKey: 'vippackage_id' });

export { User, OTP, Song, Artist, Category, Favorite, Comment, UserContribution, VipPurchase, VipPackage };
