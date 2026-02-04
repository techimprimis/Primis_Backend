import mqtt, { MqttClient } from 'mqtt';

let mqttClient: MqttClient | null = null;

export const connectMQTT = (): MqttClient => {
    if (mqttClient) {
        return mqttClient;
    }

    const brokerUrl = process.env['MQTT_BROKER_URL'] ?? 'mqtt://localhost:1883';
    const username = process.env['MQTT_USERNAME'] ?? "MQTT_USERNAME";
    const password = process.env['MQTT_PASSWORD'] ?? "MQTT_PASSWORD";

    const options: mqtt.IClientOptions = {
        clientId: `primis_backend_${Math.random().toString(16).slice(2, 10)}`,
        ...(username !== undefined && username !== '' && { username }),
        ...(password !== undefined && password !== '' && { password }),
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
    };

    console.log('Connecting to MQTT broker:', brokerUrl);

    mqttClient = mqtt.connect(brokerUrl, options);

    mqttClient.on('connect', () => {
        console.log('MQTT connected successfully');
    });

    mqttClient.on('error', (error) => {
        console.error('MQTT connection error:', error);
    });

    mqttClient.on('offline', () => {
        console.log('MQTT client offline');
    });

    mqttClient.on('reconnect', () => {
        console.log('MQTT reconnecting...');
    });

    return mqttClient;
};

export const getMQTTClient = (): MqttClient | null => {
    return mqttClient;
};

export const disconnectMQTT = (): void => {
    if (mqttClient) {
        mqttClient.end();
        mqttClient = null;
        console.log('MQTT disconnected');
    }
};
