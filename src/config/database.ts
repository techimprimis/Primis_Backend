import { MongoClient, ServerApiVersion, Db } from 'mongodb';

const uri = process.env['MONGO_URI'] ?? ''
console.log('MongoDB URI:', uri); // Debugging line to check the URI
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    tls: true,
    tlsAllowInvalidCertificates: false,
});

let db: Db;

const connectDB = async (): Promise<void> => {
    try {
        await client.connect();
        await client.db('admin').command({ ping: 1 });

        db = client.db();

        // eslint-disable-next-line no-console
        console.log('MongoDB connected successfully');
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export const getDB = (): Db => db;
export const getClient = (): MongoClient => client;
export default connectDB;
