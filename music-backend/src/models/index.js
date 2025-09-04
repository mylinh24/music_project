import { sequelize } from '../config/configdb.js';
import User from './user.js';
import OTP from './otp.js';
<<<<<<< HEAD

User.init(sequelize);
OTP.init(sequelize);
=======
import Song from './song.js';
import Artist from './artist.js';
import Category from './category.js';
import Favorite from './favorites.js';

User.init(sequelize);
OTP.init(sequelize);
Song.hasMany(Favorite, { foreignKey: 'song_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });
Favorite.belongsTo(Song, { foreignKey: 'song_id' });
>>>>>>> 14f427b2 (second commit)

User.hasMany(OTP, { foreignKey: 'userId' });

sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
}).catch((error) => {
  console.error('Error syncing database:', error);
});

<<<<<<< HEAD
export { User, OTP };
=======
export { User, OTP, Song, Artist, Category, Favorite };
>>>>>>> 14f427b2 (second commit)
