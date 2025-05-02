import { Router } from 'express';
import { getVehiculosDisponibles, obtenerVehiculoPorId } from '../controllers/filtroMapaPrecioController';

const router = Router();

router.get('/gps', getVehiculosDisponibles);
router.get('/gps/:id', obtenerVehiculoPorId);

export default router;
