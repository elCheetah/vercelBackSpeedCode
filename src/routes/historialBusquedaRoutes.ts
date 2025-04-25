import { Router } from 'express';
import {
  verUltimasBusquedas,
  guardarBusqueda,
  sugerenciasBusqueda,
} from '../controllers/historialBusquedaController';

const router = Router();

router.get('/historial/:usuarioId', verUltimasBusquedas);
router.post('/historial', guardarBusqueda);
router.get('/autocomplete/:usuarioId', sugerenciasBusqueda);

export default router;
