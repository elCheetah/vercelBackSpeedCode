import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import rutasPago from './routes/pago.routes';
import qrRoutes from './routes/generarQRRoute';
import historialBusquedaRoutes from './routes/historialBusquedaRoutes';
import  vehiculoRoutes  from './routes/vehiculoRoutes';
import reservasRoutes from './routes/reservas.routes'

import limpiezaRoutes from './routes/limpieza.ruta';
const cors = require('cors');


const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());


// Rutas de APIs
app.use('/pagos', rutasPago);
app.use('/', qrRoutes);
app.use('/historial', historialBusquedaRoutes);
app.use('/vehiculo', vehiculoRoutes);
app.use('/reservas',reservasRoutes);


app.use('/public', limpiezaRoutes); 


// Ruta pública para comprobantes (se sirve desde public/cmp)
app.use('/cmp', express.static(path.join(process.cwd(), 'public', 'cmp'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    }
  }
}));

// Ruta pública para archivos QR (se sirve desde public/qr)
app.use('/qr', express.static(path.join(process.cwd(), 'public', 'qr'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    }
  }
}));




app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});