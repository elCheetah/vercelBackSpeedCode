import { Router } from 'express';
import { generarQR } from '../controllers/generarQRController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/generarQR/:tipo/:monto/:idReserva', asyncHandler(generarQR));

export default router;
