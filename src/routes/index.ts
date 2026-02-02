import { Router } from 'express';
import userController from '../controllers/user.controller';
import deviceController from '../controllers/device.controller';

const router = Router();

router.use('/users', userController);
router.use('/devices', deviceController);

export default router;
