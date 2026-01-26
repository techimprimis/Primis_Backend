import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express, { Application, Request, Response } from 'express';
import connectDB from './config/database';
import routes from './routes';
import { errorHandler, notFound } from './utils/errorHandler';

const app: Application = express();
const PORT = process.env['PORT'] ?? 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health-check', (_req: Request, res: Response): void => {
    res.json({ message: 'Server is running!' });
});

// API Routes
app.use('/api/v1', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async (): Promise<void> => {
    await connectDB();

    app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

void startServer();
