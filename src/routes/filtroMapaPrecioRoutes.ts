// src/routes/filtroMapaPrecioRoutes.ts
import { Router } from 'express';
import {
  getVehiculosDisponibles,
  obtenerVehiculoPorId,
  filtrarVehiculos,
} from '../controllers/filtroMapaPrecioController';

const router = Router();

router.get('/gps', getVehiculosDisponibles);
router.get('/gps/:id', obtenerVehiculoPorId);
router.get('/', filtrarVehiculos);

export default router;
