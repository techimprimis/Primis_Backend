import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

let wss: WebSocketServer | null = null;

export interface IWebSocketMessage {
    type: 'mqtt_data' | 'device_status' | 'telemetry' | 'connection';
    data: {
        imei?: string;
        topic?: string;
        payload?: Record<string, unknown>;
        status?: string;
        timestamp: string;
        message?: string;
    };
}

export const initializeWebSocket = (server: Server): WebSocketServer => {
    wss = new WebSocketServer({ server, path: '/ws' });

    wss.on('connection', (ws: WebSocket) => {
        // eslint-disable-next-line no-console
        console.log('New WebSocket client connected');

        // Send welcome message
        const welcomeMessage: IWebSocketMessage = {
            type: 'connection',
            data: {
                message: 'Connected to Primis Backend WebSocket',
                timestamp: new Date().toISOString(),
            },
        };
        ws.send(JSON.stringify(welcomeMessage));

        // Handle incoming messages from client
        ws.on('message', (message: Buffer) => {
            try {
                const data = JSON.parse(message.toString()) as Record<string, unknown>;
                // eslint-disable-next-line no-console
                console.log('Received from client:', data);

                // Handle client messages (e.g., subscription requests)
                // You can extend this to handle specific client requests
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error parsing WebSocket message:', error);
            }
        });

        // Handle client disconnection
        ws.on('close', () => {
            // eslint-disable-next-line no-console
            console.log('WebSocket client disconnected');
        });

        // Handle errors
        ws.on('error', (error) => {
            // eslint-disable-next-line no-console
            console.error('WebSocket error:', error);
        });
    });

    // eslint-disable-next-line no-console
    console.log('WebSocket server initialized on path /ws');

    return wss;
};

export const getWebSocketServer = (): WebSocketServer | null => {
    return wss;
};

export const broadcastToClients = (message: IWebSocketMessage): void => {
    if (!wss) {
        console.error('WebSocket server not initialized');
        return;
    }

    const messageString = JSON.stringify(message);
    let clientCount = 0;

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageString);
            clientCount++;
        }
    });

    // eslint-disable-next-line no-console
    console.log(`Broadcasted message to ${clientCount} WebSocket client(s)`);
};

export const broadcastMQTTData = (
    imei: string,
    topic: string,
    payload: Record<string, unknown>
): void => {
    const message: IWebSocketMessage = {
        type: 'mqtt_data',
        data: {
            imei,
            topic,
            payload,
            timestamp: new Date().toISOString(),
        },
    };
    broadcastToClients(message);
};

export const broadcastDeviceStatus = (
    imei: string,
    status: string
): void => {
    const message: IWebSocketMessage = {
        type: 'device_status',
        data: {
            imei,
            status,
            timestamp: new Date().toISOString(),
        },
    };
    broadcastToClients(message);
};

export const broadcastTelemetry = (
    imei: string,
    payload: Record<string, unknown>
): void => {
    const message: IWebSocketMessage = {
        type: 'telemetry',
        data: {
            imei,
            payload,
            timestamp: new Date().toISOString(),
        },
    };
    broadcastToClients(message);
};

export const closeWebSocketServer = (): Promise<void> => {
    return new Promise((resolve) => {
        if (!wss) {
            resolve();
            return;
        }

        // eslint-disable-next-line no-console
        console.log('Closing WebSocket server...');

        // Close all client connections
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.close(1001, 'Server shutting down');
            }
        });

        // Close the WebSocket server
        wss.close(() => {
            // eslint-disable-next-line no-console
            console.log('WebSocket server closed');
            wss = null;
            resolve();
        });
    });
};
