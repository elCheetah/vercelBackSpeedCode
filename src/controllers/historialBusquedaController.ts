import { Request, Response } from 'express';
import {
  obtenerUltimasBusquedas,
  registrarBusqueda,
  autocompletarBusquedas,
} from '../services/historialBusquedaService';

export const verUltimasBusquedas = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);
    const limite = req.query.limite ? parseInt(req.query.limite as string) : 5;

    if (isNaN(usuarioId)) {
      res.status(400).json({ error: 'ID de usuario inválido' });
      return;
    }

    const busquedas = await obtenerUltimasBusquedas(usuarioId, limite);

    const resultadoFormateado = busquedas.map((b) => ({
      ...b,
      termino_busqueda:
        b.termino_busqueda.length > 25
          ? b.termino_busqueda.slice(0, 20) + '...'
          : b.termino_busqueda,
    }));

    res.status(200).json(resultadoFormateado);
  } catch (error) {
    console.error('Error al obtener historial de búsqueda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const guardarBusqueda = async (req: Request, res: Response): Promise<void> => {
  try {
    const { usuarioId, termino, filtros } = req.body;

    if (!usuarioId || !termino) {
      res.status(400).json({ error: 'usuarioId y término son requeridos' });
      return;
    }

    const nuevaBusqueda = await registrarBusqueda(usuarioId, termino, filtros);
    res.status(200).json(nuevaBusqueda);
  } catch (error: any) {
    console.error('Error al guardar búsqueda:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
};

export const sugerenciasBusqueda = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = parseInt(req.params.usuarioId);
    const texto = req.query.texto?.toString() || '';

    if (!texto) {
      res.status(400).json({ error: 'Texto para autocompletar requerido' });
      return;
    }

    const sugerencias = await autocompletarBusquedas(usuarioId, texto);
    res.status(200).json(sugerencias);
  } catch (error) {
    console.error('Error al autocompletar búsqueda:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
