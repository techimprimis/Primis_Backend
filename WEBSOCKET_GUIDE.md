# WebSocket Integration Guide

## Overview

The Primis Backend now includes WebSocket support to broadcast real-time MQTT data to connected UI clients. When the MQTT broker receives data from devices, it is automatically broadcasted to all connected WebSocket clients.

## WebSocket Endpoint

```
ws://localhost:3000/ws
```

## Features

- **Real-time Data Broadcasting**: All MQTT messages are automatically broadcasted to WebSocket clients
- **Multiple Message Types**: Supports different message types for better data organization
- **Auto-reconnection**: Clients can implement reconnection logic
- **Multiple Clients**: Supports multiple simultaneous WebSocket connections

## Message Types

The WebSocket broadcasts 4 types of messages:

### 1. Connection Message
Sent when a client first connects to the WebSocket server.

```json
{
  "type": "connection",
  "data": {
    "message": "Connected to Primis Backend WebSocket",
    "timestamp": "2026-02-01T10:30:00.000Z"
  }
}
```

### 2. MQTT Data Message
Broadcasted when any MQTT data is received from a device.

```json
{
  "type": "mqtt_data",
  "data": {
    "imei": "123456789012345",
    "topic": "devices/123456789012345/data",
    "payload": {
      "temperature": 25.5,
      "humidity": 60
    },
    "timestamp": "2026-02-01T10:30:00.000Z"
  }
}
```

### 3. Device Status Message
Broadcasted when a device status changes (online/offline).

```json
{
  "type": "device_status",
  "data": {
    "imei": "123456789012345",
    "status": "online",
    "timestamp": "2026-02-01T10:30:00.000Z"
  }
}
```

### 4. Telemetry Message
Broadcasted specifically for telemetry data from devices.

```json
{
  "type": "telemetry",
  "data": {
    "imei": "123456789012345",
    "payload": {
      "voltage": 12.5,
      "current": 2.3,
      "power": 28.75
    },
    "timestamp": "2026-02-01T10:30:00.000Z"
  }
}
```

## Testing the WebSocket Connection

### Method 1: Using the HTML Test Client

1. Open `websocket-test-client.html` in your browser
2. Click the "Connect" button
3. You'll see real-time messages as MQTT data arrives

### Method 2: Using JavaScript in Browser Console

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
    console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Received:', message);
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};
```

### Method 3: Using a WebSocket Client Tool

You can use tools like:
- **Postman** (supports WebSocket connections)
- **WebSocket King** (Chrome extension)
- **wscat** (Node.js CLI tool)

Using wscat:
```bash
npm install -g wscat
wscat -c ws://localhost:3000/ws
```

## Integration with UI Framework

### React Example

```javascript
import { useEffect, useState } from 'react';

function MQTTDataDisplay() {
    const [messages, setMessages] = useState([]);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const websocket = new WebSocket('ws://localhost:3000/ws');

        websocket.onopen = () => {
            console.log('WebSocket Connected');
        };

        websocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages(prev => [message, ...prev].slice(0, 100)); // Keep last 100 messages
        };

        websocket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        websocket.onclose = () => {
            console.log('WebSocket Disconnected');
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, []);

    return (
        <div>
            <h2>Real-time MQTT Data</h2>
            {messages.map((msg, index) => (
                <div key={index}>
                    <strong>{msg.type}:</strong>
                    <pre>{JSON.stringify(msg.data, null, 2)}</pre>
                </div>
            ))}
        </div>
    );
}
```

### Vue.js Example

```javascript
export default {
    data() {
        return {
            ws: null,
            messages: []
        };
    },
    mounted() {
        this.connectWebSocket();
    },
    beforeUnmount() {
        if (this.ws) {
            this.ws.close();
        }
    },
    methods: {
        connectWebSocket() {
            this.ws = new WebSocket('ws://localhost:3000/ws');

            this.ws.onopen = () => {
                console.log('WebSocket Connected');
            };

            this.ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.messages.unshift(message);
                // Keep only last 100 messages
                if (this.messages.length > 100) {
                    this.messages.pop();
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            this.ws.onclose = () => {
                console.log('WebSocket Disconnected');
                // Optional: Implement reconnection logic
                setTimeout(() => this.connectWebSocket(), 5000);
            };
        }
    }
};
```

### Angular Example

```typescript
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private ws: WebSocket;
    private messagesSubject = new Subject<any>();

    constructor() {
        this.connect();
    }

    connect() {
        this.ws = new WebSocket('ws://localhost:3000/ws');

        this.ws.onopen = () => {
            console.log('WebSocket Connected');
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.messagesSubject.next(message);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        this.ws.onclose = () => {
            console.log('WebSocket Disconnected');
            setTimeout(() => this.connect(), 5000);
        };
    }

    getMessages(): Observable<any> {
        return this.messagesSubject.asObservable();
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}
```

## Architecture Flow

```
MQTT Broker → MQTT Controller → Device Service → Database
                    ↓
            WebSocket Broadcast
                    ↓
            Connected UI Clients
```

1. Device sends data to MQTT broker
2. MQTT Controller receives the message
3. Data is saved to the database
4. WebSocket broadcasts the data to all connected clients
5. UI receives and displays real-time data

## Configuration

The WebSocket server is automatically initialized when the Express server starts. No additional configuration is required.

## Error Handling

- If WebSocket server is not initialized, broadcast functions will log an error
- Client disconnections are handled gracefully
- Malformed messages from clients are caught and logged

## Performance Considerations

- WebSocket broadcasts are non-blocking
- Only clients with open connections receive broadcasts
- Messages are stringified once and sent to all clients
- Consider implementing message throttling for high-frequency data

## Security Recommendations

For production use, consider:

1. **Authentication**: Implement token-based authentication
2. **CORS**: Configure proper CORS policies
3. **WSS**: Use secure WebSocket (wss://) with SSL/TLS
4. **Rate Limiting**: Implement rate limiting for WebSocket connections
5. **Message Validation**: Validate incoming messages from clients

## Troubleshooting

### WebSocket connection fails
- Ensure the server is running
- Check the WebSocket URL is correct (ws://localhost:3000/ws)
- Verify no firewall is blocking WebSocket connections

### No messages received
- Check MQTT broker is connected and sending data
- Verify devices are publishing to the correct topics
- Check browser console for WebSocket errors

### Connection keeps dropping
- Implement ping/pong heartbeat mechanism
- Check network stability
- Implement auto-reconnection logic in the client

## Next Steps

Consider implementing:
- WebSocket authentication using JWT tokens
- Room-based subscriptions (clients subscribe to specific devices)
- Message filtering based on client preferences
- Compression for large payloads
- Connection limits and rate limiting
