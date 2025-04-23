import { Request, Response } from 'express';
import { obtenerUltimasBusquedas } from '../services/HistorialBusqueda';

export const verUltimasBusquedas = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);
    const limite = req.query.limite ? parseInt(req.query.limite as string) : 10;

    if (isNaN(usuarioId)) {
      res.status(400).json({ error: 'ID de usuario inválido' });
      return;
    }

    const busquedas = await obtenerUltimasBusquedas(usuarioId, limite);
    res.status(200).json(busquedas);
  } catch (error) {
    console.error('Error al obtener historial de búsqueda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};