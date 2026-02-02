
import { Pool } from 'pg';
import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
    region: process.env['AWS_REGION'] ?? 'us-east-1',
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const pool = new Pool({
    host: "localhost",
    port: 5433,          // local forwarded port
    user: "dbuser",
    password: "password",
    database: "postgres"
});

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