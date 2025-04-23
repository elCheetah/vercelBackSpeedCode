import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import rutasPago from './routes/pago.routes';
import qrRoutes from './routes/generarQRRoute';
import historialBusquedaRoutes from './routes/historialBusquedaRoutes';
import  vehiculoRoutes  from './routes/vehiculoRoutes';
import reservasRoutes from './routes/reservas.routes'

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




app.use('/temp', express.static(path.join(process.cwd(), 'src', 'temp'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    }
  }
}));

app.use('/comprobante', express.static(path.join(process.cwd(), 'src', 'comprobante'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    }
  }
}));



app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});