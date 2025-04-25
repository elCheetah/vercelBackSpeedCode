import { Router } from 'express';
import {
  verUltimasBusquedas,
  guardarBusqueda,
  sugerenciasBusqueda,
} from '../controllers/historialBusquedaController';

const router = Router();

router.get('/:usuarioId', verUltimasBusquedas);               // Ver historial
router.post('/:usuarioId', guardarBusqueda);                  // Guardar búsqueda
router.get('/:usuarioId/sugerencias', sugerenciasBusqueda);   // Autocompletado

export default router;
