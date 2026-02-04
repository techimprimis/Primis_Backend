import { getPool } from '../config/database';
import { IDevice, DEVICES_TABLE, DEVICE_DATA_TABLE, IDeviceResponse } from '../models/device.model';
import { QueryResult } from 'pg';

export const getAllDevices = async (): Promise<IDevice[]> => {
    const pool = getPool();
    const result: QueryResult<IDevice> = await pool.query(`SELECT * FROM ${DEVICES_TABLE} ORDER BY created_at DESC`);
    return result.rows;
};

export const getDeviceById = async (id: number): Promise<IDevice | null> => {
    const pool = getPool();
    const result: QueryResult<IDevice> = await pool.query(`SELECT * FROM ${DEVICES_TABLE} WHERE device_id = $1`, [id]);
    return result.rows[0] ?? null;
};

export const getDeviceByImei = async (imei: string): Promise<IDevice | null> => {
    const pool = getPool();
    const result: QueryResult<IDevice> = await pool.query(`SELECT * FROM ${DEVICES_TABLE} WHERE imei = $1`, [imei]);
    return result.rows[0] ?? null;
};

export const createDevice = async (imei: string, status: 'online' | 'offline' = 'offline'): Promise<IDevice> => {
    const pool = getPool();
    const now = new Date();
    const result: QueryResult<IDevice> = await pool.query(
        `INSERT INTO ${DEVICES_TABLE} (imei, status, created_at) VALUES ($1, $2, $3) RETURNING *`,
        [imei, status, now]
    );
    if (!result.rows[0]) {
        throw new Error('Failed to create device');
    }
    return result.rows[0];
};

export const updateDeviceStatus = async (imei: string, status: 'online' | 'offline'): Promise<IDevice | null> => {
    const pool = getPool();
    const result: QueryResult<IDevice> = await pool.query(
        `UPDATE ${DEVICES_TABLE} SET status = $1 WHERE imei = $2 RETURNING *`,
        [status, imei]
    );
    return result.rows[0] ?? null;
};

export const deleteDevice = async (id: number): Promise<boolean> => {
    const pool = getPool();
    const result: QueryResult = await pool.query(`DELETE FROM ${DEVICES_TABLE} WHERE device_id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
};

// Device Data functions
export const saveDeviceData = async (deviceData: {
    imei: string;
    topic: string;
    payload: Record<string, unknown>;
}): Promise<IDeviceResponse> => {
    const pool = getPool();
    const now = new Date();

    // Get device by IMEI
    const device = await getDeviceByImei(deviceData.imei);
    if (!device || isNaN(Number(device.device_id)) || device.device_id === 0) {
        throw new Error(`Device not found with IMEI: ${deviceData.imei}`);
    }

    const result: QueryResult<IDeviceResponse> = await pool.query(
        `INSERT INTO ${DEVICE_DATA_TABLE} (device_id, topic, response, created_at) VALUES ($1, $2, $3, $4) RETURNING *`,
        [device.device_id, deviceData.topic, JSON.stringify(deviceData.payload), now]
    );
    if (!result.rows[0]) {
        throw new Error('Failed to save device data');
    }
    return result.rows[0];
};

export const getDeviceData = async (deviceId: number, limit: number = 100): Promise<IDeviceResponse[]> => {
    const pool = getPool();

    const result: QueryResult<IDeviceResponse> = await pool.query(
        `SELECT * FROM ${DEVICE_DATA_TABLE} WHERE device_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [deviceId, limit]
    );
    return result.rows;
};

export const getDeviceDataByImei = async (imei: string, limit: number = 100): Promise<IDeviceResponse[]> => {
    const pool = getPool();

    // Get device by IMEI
    const device = await getDeviceByImei(imei);
    if (!device || isNaN(Number(device.device_id)) || device.device_id === 0) {
        return [];
    }

    const result: QueryResult<IDeviceResponse> = await pool.query(
        `SELECT * FROM ${DEVICE_DATA_TABLE} WHERE device_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [device.device_id, limit]
    );
    return result.rows;
};
