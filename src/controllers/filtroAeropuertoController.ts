import { Request, Response } from 'express';
import { z } from 'zod';
import {
  autocompletarAeropuertoService,
  obtenerVehiculosCercanosService
} from '../services/filtroAeropuertoService';

// ====================
// Autocompletar aeropuertos por nombre
// ====================
export const autocompletarAeropuerto = async (req: Request, res: Response): Promise<any> => {
  const { q } = req.query;

  // Validar que el parámetro de búsqueda 'q' esté presente
  if (typeof q !== 'string' || q.trim() === '') {
    res.status(400).json({ mensaje: 'Debe ingresar un nombre de aeropuerto.' });
    return;
  }

  try {
    // Llamar al servicio de autocompletado
    const resultados = await autocompletarAeropuertoService(q.trim());

    // Si no hay resultados, devolver mensaje de error
    if (resultados.length === 0) {
      res.status(404).json({ mensaje: 'No se encontraron resultados.' });
      return;
    }

    // Devolver los resultados encontrados
    res.json(resultados);
  } catch (error) {
    console.error('Error al buscar aeropuertos:', error);
    res.status(500).json({ mensaje: 'Error de servidor al buscar aeropuertos.' });
  }
};

// ====================
// Obtener vehículos cercanos a un aeropuerto
// ====================
export const obtenerVehiculosCercanos = async (req: Request, res: Response): Promise<any> => {
  const schema = z.object({
    idAeropuerto: z.coerce.number().int(),
  });

  const parsed = schema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ mensaje: 'Debe proporcionar un ID de aeropuerto válido.' });
    return;
  }

  try {
    const resultado = await obtenerVehiculosCercanosService(parsed.data.idAeropuerto);

    if (resultado.length === 0) {
      res.status(200).json({ mensaje: 'No se encontraron vehículos disponibles cerca.' });
      return;
    }

    res.json(resultado);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error al obtener vehículos cercanos:', error.message);
      res.status(500).json({ mensaje: error.message || 'Error al obtener vehículos cercanos.' });
    } else {
      console.error('Error desconocido:', error);
      res.status(500).json({ mensaje: 'Error desconocido al obtener vehículos cercanos.' });
    }
  }
};
