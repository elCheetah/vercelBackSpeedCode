import express from 'express';
import reservasRoutes from './routes/reservas.routes';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/reservas', reservasRoutes);

export default app;
