import { Router } from 'express';
import { autosPorDistancia } from '../controllers/filtroGPSController';

const router = Router();

router.get('/distancia/:latitud/:longitud/:dkm', autosPorDistancia);

export default router;
