import { Router } from 'express';
import { getVehiculosPorDistancia } from '../controllers/filtroGPSController';

const router = Router();

router.get('/distancia/:lat/:lng', (req, res) => {
    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lng);
    const dkm = 5; // Valor por defecto
    getVehiculosPorDistancia(req, res);
});

router.get('/distancia/:lat/:lng/:dkm', (req, res) => {
    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lng);
    const dkm = req.params.dkm ? parseFloat(req.params.dkm) : 5; // Valor por defecto
    getVehiculosPorDistancia(req, res);
});

export default router;