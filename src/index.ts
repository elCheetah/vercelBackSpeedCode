import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import historialRoutes from "./routes/speedcode/historialBusquedaRoutes";
import mapaRoutesApi from "./routes/speedcode/filtroMapaPrecioRoutes";
import conductoresRoutes from './routes/speedcode/conductoresRoutes'; //agregado

// Comentadas temporalmente - descomenta cuando las necesites
import rutasPago from './routes/pago.routes';
import qrRoutes from './routes/generarQRRoute';
import reservasRoutes from './routes/reservas.routes';

const app = express();
dotenv.config();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de APIs
app.use('/api', mapaRoutesApi);
app.use('/historial', historialRoutes);

// Rutas comentadas - descomenta cuando las necesites
app.use('/pagos', rutasPago);
app.use('/', qrRoutes);
app.use('/reservas', reservasRoutes);
app.use('/api/conductores', conductoresRoutes);//recien agregada

// Archivos estáticos para comprobantes
app.use(
  '/cmp',
  express.static(path.join(process.cwd(), 'public', 'cmp'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.png')) {
        res.set('Content-Type', 'image/png');
      }
    },
  })
);

// Archivos estáticos para códigos QR
app.use(
  '/qr',
  express.static(path.join(process.cwd(), 'public', 'qr'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.png')) {
        res.set('Content-Type', 'image/png');
      }
    },
  })
);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});