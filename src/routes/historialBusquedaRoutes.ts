import { Router } from 'express';
import { verUltimasBusquedas } from '../controllers/historialBusquedaController';

const router = Router();

router.get('/historial/:usuarioId', verUltimasBusquedas);

export default router;