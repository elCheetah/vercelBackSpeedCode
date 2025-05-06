import { Router } from 'express';
import { autocompletarAeropuerto, obtenerVehiculosCercanos } from '../controllers/filtroAeropuertoController';

const router = Router();

router.get('/autocompletar', autocompletarAeropuerto);
router.get('/vehiculos-cercanos/:idAeropuerto', obtenerVehiculosCercanos);

export default router;
