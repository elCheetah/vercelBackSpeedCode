import { Router } from 'express';
import { limpiarCarpetaPublica } from '../controllers/limpieza.controller';

const router = Router();

router.get('/limpiarDirPublic', limpiarCarpetaPublica);

export default router;
