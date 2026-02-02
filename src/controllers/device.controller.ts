import { Router, RequestHandler } from 'express';
import * as deviceService from '../middleware/device.service';
import { IDeviceResponse } from '../models/device.model';

interface ICreateDeviceBody {
    imei: string;
    status?: 'online' | 'offline';
}

interface IUpdateDeviceBody {
    imei: string;
    status?: 'online' | 'offline';
}

const deviceRoutes = Router();

// Get all devices
const getAllDevices: RequestHandler = (_req, res) => {
    void (async (): Promise<void> => {
        try {
            const devices = await deviceService.getAllDevices();
            res.json(devices);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    })();
};


// Get device by IMEI
const getDeviceByImei: RequestHandler = (req, res) => {
    void (async (): Promise<void> => {
        try {
            const { imei } = req.params;
            if (typeof imei !== 'string' || imei === '') {
                res.status(400).json({ error: 'IMEI is required' });
                return;
            }
            const device = await deviceService.getDeviceByImei(imei);

            if (!device) {
                res.status(404).json({ error: 'Device not found' });
                return;
            }

            res.json(device);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    })();
};

// Create new device
const createDevice: RequestHandler<object, object, ICreateDeviceBody> = (req, res) => {
    void (async (): Promise<void> => {
        try {
            const { imei, status } = req.body;

            if (!imei || imei === '') {
                res.status(400).json({ error: 'IMEI is required' });
                return;
            }

            // Check if device with IMEI already exists
            const existingDevice = await deviceService.getDeviceByImei(imei);
            if (existingDevice) {
                res.status(409).json({ error: 'Device with this IMEI already exists' });
                return;
            }

            const device = await deviceService.createDevice(imei, status ?? 'offline');
            res.status(201).json(device);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    })();
};

// Update device
const updateDevice: RequestHandler<object, object, IUpdateDeviceBody> = (req, res) => {
    void (async (): Promise<void> => {
        try {
            const { imei, status } = req.body;

            if (!imei || imei === '') {
                res.status(400).json({ error: 'Device IMEI is required' });
                return;
            }

            if (!status) {
                res.status(400).json({ error: 'Status is required' });
                return;
            }

            const device = await deviceService.updateDeviceStatus(imei, status);

            if (!device) {
                res.status(404).json({ error: 'Device not found' });
                return;
            }

            res.json(device);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    })();
};

// Delete device
const deleteDevice: RequestHandler<{ imei: string }> = (req, res) => {
    void (async (): Promise<void> => {
        try {
            const { imei } = req.params;
            if (typeof imei !== 'string' || imei === '') {
                res.status(400).json({ error: 'Device IMEI is required' });
                return;
            }

            // First get the device to find its ID
            const device = await deviceService.getDeviceByImei(imei);
            if (!device || typeof device.device_id !== 'number') {
                res.status(404).json({ error: 'Device not found' });
                return;
            }

            const success = await deviceService.deleteDevice(device.device_id);

            if (!success) {
                res.status(404).json({ error: 'Device not found' });
                return;
            }

            res.json({ message: 'Device deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    })();
};

// Get device data history
const getDeviceData: RequestHandler<{ imei: string }> = (req, res) => {
    void (async (): Promise<void> => {
        try {
            const { imei } = req.params;
            if (typeof imei !== 'string' || imei === '') {
                res.status(400).json({ error: 'Device IMEI is required' });
                return;
            }

            const limitParam = req.query['limit'];
            const limit = typeof limitParam === 'string' ? parseInt(limitParam, 10) : 100;

            const data: IDeviceResponse[] = await deviceService.getDeviceDataByImei(imei, limit);

            res.json(data);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
        }
    })();
};

// Routes
deviceRoutes.get('/', getAllDevices);
deviceRoutes.get('/imei/:imei', getDeviceByImei);
deviceRoutes.post('/', createDevice);
deviceRoutes.put('/', updateDevice);
deviceRoutes.delete('/imei/:imei', deleteDevice);
deviceRoutes.get('/data/imei/:imei', getDeviceData);

export default deviceRoutes;
