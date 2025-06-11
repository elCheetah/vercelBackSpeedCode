import { Router } from 'express';
import {
  asignarConductores,
  obtenerConductores,
  eliminarConductor,
} from '../../controllers/speedcode/conductoresController';

const router = Router();

router.post('/asignar', asignarConductores);
router.get('/:idReserva', obtenerConductores);
router.delete('/:idReserva/:idUsuario', eliminarConductor);

export default router;
