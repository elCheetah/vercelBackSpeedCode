import { Request, Response } from 'express';
import { obtenerAutosCercanos } from '../services/filtroGPSService';

export async function autosPorDistancia(req: Request, res: Response) {
  try {
    const { latitud, longitud, dkm } = req.params;
    const lat = parseFloat(latitud);
    const lon = parseFloat(longitud);
    const dist = dkm ? parseFloat(dkm) : 10; // valor por defecto: 10 km

    const autos = await obtenerAutosCercanos(lat, lon, dist);
    res.json(autos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar autos cercanos' });
  }
}
