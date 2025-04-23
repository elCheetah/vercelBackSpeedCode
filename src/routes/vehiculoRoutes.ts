import { Router } from 'express';
import { getTopVehiculos, getVehiculoConReserva } from '../controllers/vehiculoController';

const router = Router();

router.get('/obtenerVehiculosTop', getTopVehiculos);
router.get("/obtenerDetalleVehiculo/:id", getVehiculoConReserva);

export default router; // ✅ debe exportar un router
