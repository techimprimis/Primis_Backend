import { Router } from 'express';
import userController from '../controllers/user.controller';

const router = Router();

router.use('/users', userController);

export default router;
