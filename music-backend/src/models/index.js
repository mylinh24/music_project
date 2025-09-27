import { sequelize } from '../config/configdb.js';
import User from './user.js';
import OTP from './otp.js';
import Song from './song.js';
import Artist from './artist.js';
import Category from './category.js';
import Favorite from './favorites.js';
import Comment from './comment.js';

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

// Add VipPurchase association
User.hasMany(VipPurchase, { foreignKey: 'user_id', as: 'vipPurchases' });
VipPurchase.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
VipPackage.hasMany(VipPurchase, { foreignKey: 'vippackage_id', as: 'vipPurchases' });
VipPurchase.belongsTo(VipPackage, { foreignKey: 'vippackage_id', as: 'vippackage' });

export { User, OTP, Song, Artist, Category, Favorite, Comment, VipPurchase, VipPackage };
