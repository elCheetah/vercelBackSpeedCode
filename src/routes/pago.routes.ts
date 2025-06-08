/*
import { Router } from 'express';
import * as PagoController from '../controllers/pago.controller';

const router = Router();

router.post('/pagarConTarjeta/:reserva_idreserva', (req, res, next) => {
    console.log('Ruta alcanzada:', req.originalUrl);
    next();  
  }, PagoController.realizarPagoTarjeta);
router.post('/pagarConQR/:reserva_idreserva', PagoController.realizarPagoQR);
router.get('/', PagoController.obtenerPagos);

export default router;
*/