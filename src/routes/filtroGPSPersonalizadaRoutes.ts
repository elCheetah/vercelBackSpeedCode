import { Router } from 'express';
import { buscarVehiculosCercanos } from '../controllers/filtroGPSPersonalizadaController';  // Correcto

const router = Router();

// GET /vehiculos/cercanos?lat=...&lon=...&radio=...
router.get('/cercanos', buscarVehiculosCercanos);

export default router;
