export interface IDevice {
    device_id?: number;
    imei: string;
    status: 'online' | 'offline';
    created_at: Date;
}

export interface IDeviceResponse {
    device_response_id?: number;
    device_id: number;
    topic: string;
    response: Record<string, unknown>;
    created_at: Date;
}

export const SCHEMA_NAME = 'primisapp';
export const DEVICES_TABLE = `${SCHEMA_NAME}.devices`;
export const DEVICE_DATA_TABLE = `${SCHEMA_NAME}.device_responses`;