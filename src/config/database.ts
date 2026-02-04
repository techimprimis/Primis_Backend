
import { Pool } from 'pg';
import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
    region: process.env['AWS_REGION'] ?? 'us-east-1',
});

// Database configuration from environment variables
const dbConfig = {
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    user: process.env['DB_USER'] ?? 'postgres',
    password: process.env['DB_PASSWORD'] ?? 'password',
    database: process.env['DB_NAME'] ?? 'primisdb',
    ssl: {
        rejectUnauthorized: process.env['NODE_ENV'] === 'production' ? (process.env['DB_SSL_REJECT_UNAUTHORIZED'] === 'true') : false,
    },
};
console.log('Database configuration:', dbConfig);
const pool = new Pool(dbConfig);

const connectDB = async (): Promise<void> => {
    try {
        await pool.connect();
        const res = await pool.query('SELECT version()');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-console
        console.log(res.rows[0].version);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Database error:', error);
        throw error;
    }
};

export const closeDatabase = async (): Promise<void> => {
    try {
        await pool.end();
        // eslint-disable-next-line no-console
        console.log('Database connection closed');
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error closing database connection:', error);
    }
};

export const getPool = (): Pool => pool;
export default connectDB;