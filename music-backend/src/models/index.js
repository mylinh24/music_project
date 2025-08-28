import { sequelize } from '../config/configdb.js';
import User from './user.js';
import OTP from './otp.js';

User.init(sequelize);
OTP.init(sequelize);

User.hasMany(OTP, { foreignKey: 'userId' });

sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
}).catch((error) => {
  console.error('Error syncing database:', error);
});

export { User, OTP };