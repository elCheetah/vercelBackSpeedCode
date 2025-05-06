import { Request, Response } from 'express';
import { obtenerVehiculosCercanos } from '../services/filtroGPSService';

export const getVehiculosPorDistancia = async (req: Request, res: Response) => {
  const { lat, lng, dkm } = req.params;

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  const distancia = dkm ? parseFloat(dkm) : 10; // distancia por defecto: 10 km

  if (isNaN(latNum) || isNaN(lngNum) || isNaN(distancia)) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }

  try {
    const vehiculos = await obtenerVehiculosCercanos(latNum, lngNum, distancia);
    res.json(vehiculos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener vehículos cercanos' });
  }
};