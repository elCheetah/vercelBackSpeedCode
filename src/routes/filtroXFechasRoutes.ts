import express from 'express';
import { filtroFechasController } from '../controllers/filtroXFechasController';

const router = express.Router();

/**
 * @route GET /api/filtro-fechas/vehiculos-disponibles
 * @desc Get vehicles available within a date range
 * @access Public
 * @query fechaInicio - Starting date for rental (YYYY-MM-DD)
 * @query fechaFin - Ending date for rental (YYYY-MM-DD)
 */
router.get('/vehiculos-disponibles', filtroFechasController.getVehiculosDisponiblesPorFecha);

export default router;