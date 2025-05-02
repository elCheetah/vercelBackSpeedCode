import express, { Request, Response } from 'express';
import { filtroXFechasHandler } from '../controllers/filtroXFechasController';

const router = express.Router();

router.get('/vehiculos/filtroFechas', async (req: Request, res: Response) => {
  await filtroXFechasHandler(req, res);
});

export default router;

