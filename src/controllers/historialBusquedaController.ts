import { Request, Response } from 'express';
import {
  obtenerUltimasBusquedas,
  registrarBusqueda,
  autocompletarBusquedas,
} from '../services/HistorialBusqueda';

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

export const guardarBusqueda = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);
    const { termino, filtros } = req.body;

    if (!termino || typeof termino !== 'string') {
      res.status(400).json({ error: 'Término de búsqueda inválido' });
      return;
    }

    const resultado = await registrarBusqueda(usuarioId, termino, filtros);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al guardar búsqueda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const sugerenciasBusqueda = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);
    const termino = req.query.q as string;

    if (!termino || isNaN(usuarioId)) {
      res.status(400).json({ error: 'Datos inválidos' });
      return;
    }

    const sugerencias = await autocompletarBusquedas(usuarioId, termino);
    res.status(200).json(sugerencias.map((b: { termino_busqueda: string }) => b.termino_busqueda));
  } catch (error) {
    console.error('Error al obtener sugerencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
