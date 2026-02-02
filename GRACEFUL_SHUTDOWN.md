# Graceful Shutdown Implementation

## Overview

The Primis Backend now includes graceful shutdown functionality to handle server termination elegantly, ensuring all resources are properly cleaned up before the application exits.

## Features

### 1. **Signal Handling**
The server listens for termination signals:
- **SIGTERM**: Termination signal (sent by process managers like PM2, Docker)
- **SIGINT**: Interrupt signal (Ctrl+C in terminal)

### 2. **Error Handling**
- **Uncaught Exceptions**: Catches and logs uncaught exceptions before shutdown
- **Unhandled Promise Rejections**: Catches and logs unhandled promise rejections

### 3. **Resource Cleanup**
The shutdown process ensures all resources are properly closed in order:
1. HTTP Server - stops accepting new connections
2. WebSocket Server - closes all active client connections
3. MQTT Client - disconnects from broker
4. Database Pool - closes all database connections

### 4. **Health Check During Shutdown**
The `/health-check` endpoint returns a 503 status when the server is shutting down, allowing load balancers to route traffic elsewhere.

## Implementation Details

### Graceful Shutdown Function

```typescript
const gracefulShutdown = async (signal: string): Promise<void> => {
    if (isShuttingDown) {
        return; // Prevent multiple shutdown attempts
    }

    isShuttingDown = true;
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    try {
        // 1. Stop HTTP server from accepting new connections
        if (httpServer) {
            await new Promise<void>((resolve) => {
                httpServer!.close(() => {
                    console.log('HTTP server closed');
                    resolve();
                });
            });
        }

        // 2. Close WebSocket connections
        await closeWebSocketServer();

        // 3. Disconnect MQTT
        disconnectMQTT();

        // 4. Close database connections
        await closeDatabase();

        console.log('Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
};
```

### Signal Handlers

```typescript
// Graceful shutdown on SIGTERM (from process managers)
process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));

// Graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    void gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    void gracefulShutdown('unhandledRejection');
});
```

## Resource Cleanup Functions

### WebSocket Cleanup

```typescript
export const closeWebSocketServer = (): Promise<void> => {
    return new Promise((resolve) => {
        if (!wss) {
            resolve();
            return;
        }

        console.log('Closing WebSocket server...');

        // Close all client connections with proper close code
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.close(1001, 'Server shutting down');
            }
        });

        // Close the WebSocket server
        wss.close(() => {
            console.log('WebSocket server closed');
            wss = null;
            resolve();
        });
    });
};
```

### MQTT Cleanup

```typescript
export const disconnectMQTT = (): void => {
    if (mqttClient) {
        mqttClient.end();
        mqttClient = null;
        console.log('MQTT disconnected');
    }
};
```

### Database Cleanup

```typescript
export const closeDatabase = async (): Promise<void> => {
    try {
        await pool.end();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error);
    }
};
```

## Server Error Handling

The HTTP server has error handling for common issues:

```typescript
httpServer.on('error', (error: NodeJS.ErrnoException) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    }
    void gracefulShutdown('serverError');
});
```

## Testing Graceful Shutdown

### Test with Ctrl+C

1. Start the server: `npm run dev`
2. Press `Ctrl+C`
3. Observe the shutdown sequence:
   ```
   SIGINT received. Starting graceful shutdown...
   HTTP server closed
   Closing WebSocket server...
   WebSocket server closed
   MQTT disconnected
   Database connection closed
   Graceful shutdown completed
   ```

### Test with Process Manager

When using PM2 or other process managers:
```bash
pm2 start npm --name "primis-backend" -- run start
pm2 stop primis-backend  # Sends SIGTERM
```

### Test Health Check During Shutdown

```bash
# While server is shutting down
curl http://localhost:3000/health-check
# Returns: {"message":"Server is shutting down"} with 503 status
```

## Benefits

1. **No Data Loss**: Ensures all pending database operations complete
2. **Clean Disconnections**: WebSocket clients receive proper close frames
3. **Resource Management**: Prevents resource leaks and zombie processes
4. **Deployment Safety**: Safe for use with Docker, Kubernetes, PM2
5. **Monitoring Integration**: Load balancers can detect shutdown via health check

## Production Considerations

### Timeout Implementation

For production, consider adding a shutdown timeout:

```typescript
const SHUTDOWN_TIMEOUT = 30000; // 30 seconds

const gracefulShutdown = async (signal: string): Promise<void> => {
    // ... existing code ...

    const timeoutId = setTimeout(() => {
        console.error('Shutdown timeout exceeded, forcing exit');
        process.exit(1);
    }, SHUTDOWN_TIMEOUT);

    try {
        // ... cleanup code ...
        clearTimeout(timeoutId);
    } catch (error) {
        clearTimeout(timeoutId);
        // ... error handling ...
    }
};
```

### Container Orchestration

In Docker/Kubernetes, ensure:
- Container `STOPSIGNAL` is set to `SIGTERM`
- `terminationGracePeriodSeconds` is adequate (e.g., 30s)
- Application shutdown completes before the grace period

Example Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
STOPSIGNAL SIGTERM
CMD ["npm", "start"]
```

### PM2 Configuration

Example `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'primis-backend',
    script: 'dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
```

## Troubleshooting

### Shutdown Takes Too Long
- Check for pending database queries
- Verify WebSocket clients are disconnecting
- Add timeout mechanism

### Process Won't Exit
- Check for event listeners not being removed
- Look for timers (setTimeout/setInterval) not being cleared
- Verify MQTT client is properly disconnecting

### Database Connection Errors During Shutdown
- Ensure queries complete before closing pool
- Use proper transaction handling
- Check connection pool settings

## Monitoring

Log shutdown events for monitoring:
- Signal received
- Shutdown duration
- Resources closed
- Any errors during shutdown

Example integration with monitoring service:
```typescript
import * as Sentry from '@sentry/node';

const gracefulShutdown = async (signal: string): Promise<void> => {
    Sentry.captureMessage(`Graceful shutdown initiated: ${signal}`);
    // ... shutdown logic ...
};
```

## Summary

The graceful shutdown implementation ensures:
- ✅ Clean termination of all services
- ✅ Proper resource cleanup
- ✅ No orphaned connections
- ✅ Safe deployment processes
- ✅ Better error handling
- ✅ Production-ready reliability
