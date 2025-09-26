import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
});

let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL successfully.');

        // Sync models with database (alter: true will update existing tables)
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully.');

        // Create MySQL EVENT for automatic VIP expiry update
        await sequelize.query(`DROP EVENT IF EXISTS update_vip_expiry`);
        await sequelize.query(`
            CREATE EVENT update_vip_expiry
            ON SCHEDULE EVERY 1 DAY
            STARTS CURRENT_TIMESTAMP
            DO
            UPDATE users u
            INNER JOIN (
                SELECT user_id, MAX(expiry_date) as latest_expiry
                FROM vip_purchases
                WHERE expiry_date < NOW()
                GROUP BY user_id
            ) expired_vips ON u.id = expired_vips.user_id
            SET u.vip = 0
            WHERE u.vip = 1
            AND NOT EXISTS (
                SELECT 1 FROM vip_purchases active_vip
                WHERE active_vip.user_id = u.id
                AND active_vip.expiry_date > NOW()
            )
        `);
        console.log('VIP expiry update event created successfully.');

        // Ensure event scheduler is enabled
        await sequelize.query('SET GLOBAL event_scheduler = ON;');
        console.log('Event scheduler enabled.');
    } catch (error) {
        console.error('Unable to connect to MySQL or setup event:', error);
    }
};

export { sequelize, connectDB };