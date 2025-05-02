import { Request, Response } from 'express';
import { getAvailableVehiclesByDate } from '../services/filtroXFechasService';

export async function filtroXFechasHandler(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Debes proporcionar ambas fechas.' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const vehicles = await getAvailableVehiclesByDate(start, end);
    res.json(vehicles);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
