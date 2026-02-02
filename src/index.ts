import dotenv from 'dotenv';
import path from 'path';

// Load environment variables based on NODE_ENV
const NODE_ENV = process.env['NODE_ENV'] ?? 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path.resolve(process.cwd(), envFile);

// Try to load environment-specific file, fallback to .env
dotenv.config({ path: envPath });
// Also load .env as fallback for any missing variables
dotenv.config();

// eslint-disable-next-line no-console
console.log(`Environment: ${NODE_ENV}`);
// eslint-disable-next-line no-console
console.log(`Loaded config from: ${envFile}`);

import express, { Application, Request, Response } from 'express';
import { createServer, Server } from 'http';
import connectDB, { closeDatabase } from './config/database';
// import { initializeMQTTController } from './controllers/mqtt.controller';
// import { initializeWebSocket, closeWebSocketServer } from './config/websocket.config';
import { disconnectMQTT } from './config/mqtt.config';
import routes from './routes';
import { errorHandler, notFound } from './utils/errorHandler';

const app: Application = express();
const PORT = process.env['PORT'] ?? 3000;

let httpServer: Server | null = null;
let isShuttingDown = false;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health-check', (_req: Request, res: Response): void => {
    if (isShuttingDown) {
        res.status(503).json({ message: 'Server is shutting down' });
    } else {
        res.json({ message: 'Server is running!' });
    }
});

// API Routes
app.use('/api/v1', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);


// Connect to PostgreSQL and start server
const startServer = async (): Promise<void> => {
    try {
        // Try to connect to database, but continue even if it fails
        try {
            await connectDB();
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Error: Database connection failed, continuing without database');
            throw error;
        }

        // Initialize MQTT Controller

        // initializeMQTTController();

        // Create HTTP server
        httpServer = createServer(app)

        // Initialize WebSocket server
        // initializeWebSocket(httpServer);

        // Start HTTP server with WebSocket support
        httpServer.listen(PORT, () => {
            // eslint-disable-next-line no-console
            console.log(`Server is running on http://localhost:${PORT}`);
            // eslint-disable-next-line no-console
            console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
            // eslint-disable-next-line no-console
            console.log('Press Ctrl+C to stop the server');
        });

        // Handle server errors
        httpServer.on('error', (error: NodeJS.ErrnoException) => {
            // eslint-disable-next-line no-console
            console.error('Server error:', error);
            if (error.code === 'EADDRINUSE') {
                // eslint-disable-next-line no-console
                console.error(`Port ${PORT} is already in use`);
            }
            void gracefulShutdown('serverError');
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown function
const gracefulShutdown = async (signal: string): Promise<void> => {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;
    // eslint-disable-next-line no-console
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    try {
        // Stop accepting new connections
        if (httpServer) {
            await new Promise<void>((resolve) => {
                httpServer!.close(() => {
                    // eslint-disable-next-line no-console
                    console.log('HTTP server closed');
                    resolve();
                });
            });
        }

        // Close WebSocket connections
        // await closeWebSocketServer();

        // Disconnect MQTT
        disconnectMQTT();

        // Close database connections
        await closeDatabase();

        // eslint-disable-next-line no-console
        console.log('Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
};

// Handle process signals for graceful shutdown
process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    // eslint-disable-next-line no-console
    console.error('Uncaught Exception:', error);
    void gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    void gracefulShutdown('unhandledRejection');
});

void startServer();
