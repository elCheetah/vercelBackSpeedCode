import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

import historialRoutes from "./routes/speedcode/historialBusquedaRoutes";
import mapaRoutesApi from "./routes/speedcode/filtroMapaPrecioRoutes";
import conductoresRoutes from './routes/speedcode/conductoresRoutes';

import rutasPago from './routes/pago.routes';
import qrRoutes from './routes/generarQRRoute';
import reservasRoutes from './routes/reservas.routes';

const app = express();
dotenv.config();

// ✅ CORS configurado correctamente
app.use(cors({
  origin: '*', // Cambiar por 'http://localhost:3000' o el dominio de tu frontend si es necesario
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Rutas
app.use('/api', mapaRoutesApi);
app.use('/historial', historialRoutes);
app.use('/pagos', rutasPago);
app.use('/', qrRoutes);
app.use('/reservas', reservasRoutes);
app.use('/api/conductores', conductoresRoutes);

// Archivos estáticos
app.use('/cmp', express.static(path.join(process.cwd(), 'public', 'cmp'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    }
  }
}));

app.use('/qr', express.static(path.join(process.cwd(), 'public', 'qr'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    }
  }
}));

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
