import { MqttClient } from 'mqtt';
import { connectMQTT } from '../config/mqtt.config';
import * as deviceService from '../middleware/device.service';
import { broadcastDeviceStatus, broadcastTelemetry } from '../config/websocket.config';

let mqttController: MQTTController | null = null;

export class MQTTController {
    private client: MqttClient;
    private subscribedTopics: Set<string> = new Set();

    constructor() {
        this.client = connectMQTT();
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.client.on('message', (topic: string, message: Buffer) => {
            void this.handleMessage(topic, message);
        });

        this.client.on('connect', () => {
            // Subscribe to default topics on connect
            this.subscribeToDefaultTopics();
        });
    }

    private subscribeToDefaultTopics(): void {
        const defaultTopics = [
            'devices/+/data',        // All device data
            'devices/+/status',      // All device status updates
            'devices/+/telemetry',   // All device telemetry
        ];

        defaultTopics.forEach(topic => {
            this.subscribe(topic);
        });
    }

    private async handleMessage(topic: string, message: Buffer): Promise<void> {
        try {
            // eslint-disable-next-line no-console
            console.log(`MQTT message received on topic: ${topic}`);

            const messageStr = message.toString();
            let payload: Record<string, unknown>;

            try {
                payload = JSON.parse(messageStr) as Record<string, unknown>;
            } catch {
                // If not JSON, store as plain text
                payload = { message: messageStr };
            }

            // Extract IMEI from topic (assumes format: devices/{imei}/...)
            const topicParts = topic.split('/');
            const imei = topicParts[1];

            if (imei === undefined || imei === '') {
                console.error('Could not extract IMEI from topic:', topic);
                return;
            }

            // Check if device exists, if not create it
            let device = await deviceService.getDeviceByImei(imei);
            if (!device) {
                // Auto-register device with IMEI
                device = await deviceService.createDevice(imei, 'online');
                console.log(`Auto-registered new device with IMEI: ${imei}`);
            }

            // Update device status to online
            await deviceService.updateDeviceStatus(imei, 'online');

            // Save the device data
            await deviceService.saveDeviceData({
                imei,
                topic,
                payload,
            });

            // TODO : will Broadcast MQTT data to WebSocket clients for UI updates
            // broadcastMQTTData(imei, topic, payload);

            // Handle specific topic types
            if (topic.includes('/status')) {
                await this.handleStatusMessage(imei, payload);
            } else if (topic.includes('/telemetry')) {
                this.handleTelemetryMessage(imei, payload);
            }

            // eslint-disable-next-line no-console
            console.log(`Data saved for device with IMEI ${imei} from topic ${topic}`);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error handling MQTT message:', error);
        }
    }

    private async handleStatusMessage(imei: string, payload: Record<string, unknown>): Promise<void> {
        // Handle status-specific logic
        const status = payload['status'] as string | undefined;
        if (status === 'online' || status === 'offline') {
            await deviceService.updateDeviceStatus(imei, status);
            // Broadcast device status change to WebSocket clients
            broadcastDeviceStatus(imei, status);
        }
    }

    private handleTelemetryMessage(imei: string, payload: Record<string, unknown>): void {
        // Handle telemetry-specific logic
        // You can add custom logic there like:

        // Calculate averages
        // Check if values exceed thresholds
        // Trigger alerts
        // Send notifications
        // eslint-disable-next-line no-console
        console.log(`Telemetry data from device IMEI ${imei}:`, payload);

        // Broadcast telemetry data to WebSocket clients
        broadcastTelemetry(imei, payload);
    }

    public subscribe(topic: string): void {
        if (!this.subscribedTopics.has(topic)) {
            this.client.subscribe(topic, (err) => {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.error(`Failed to subscribe to topic ${topic}:`, err);
                } else {
                    this.subscribedTopics.add(topic);
                    // eslint-disable-next-line no-console
                    console.log(`Subscribed to MQTT topic: ${topic}`);
                }
            });
        }
    }

    public unsubscribe(topic: string): void {
        if (this.subscribedTopics.has(topic)) {
            this.client.unsubscribe(topic, (err) => {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.error(`Failed to unsubscribe from topic ${topic}:`, err);
                } else {
                    this.subscribedTopics.delete(topic);
                    // eslint-disable-next-line no-console
                    console.log(`Unsubscribed from MQTT topic: ${topic}`);
                }
            });
        }
    }

    public publish(topic: string, message: string | Buffer): void {
        this.client.publish(topic, message, (err) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error(`Failed to publish to topic ${topic}:`, err);
            } else {
                // eslint-disable-next-line no-console
                console.log(`Published message to topic: ${topic}`);
            }
        });
    }

    public getSubscribedTopics(): string[] {
        return Array.from(this.subscribedTopics);
    }
}


export const initializeMQTTController = (): MQTTController => {
    if (!mqttController) {
        mqttController = new MQTTController();
    }
    return mqttController;
};

export const getMQTTController = (): MQTTController | null => {
    return mqttController;
};
