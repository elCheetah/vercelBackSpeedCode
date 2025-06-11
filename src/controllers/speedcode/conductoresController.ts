import { Request, Response } from 'express';
import {
  asignarConductoresService,
  obtenerConductoresService,
  eliminarConductorService,
} from '../../services/speedcode/conductoresService';

export const asignarConductores = async (req: Request, res: Response): Promise<any> => {
  const { idReserva, idUsuarios } = req.body;

  if (!idReserva || !Array.isArray(idUsuarios)) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    const asignaciones = await asignarConductoresService(Number(idReserva), idUsuarios);
    res.json({ message: 'Conductores asignados', asignaciones });
  } catch (error) {
    const err = error as Error;

    if (err.message === 'RESERVA_NO_ENCONTRADA') {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    if (err.message === 'CLIENTE_NO_ES_DRIVER') {
      return res.status(400).json({ error: 'El cliente no está registrado como driver' });
    }

    console.error('[ERROR asignarConductores]', error);
    res.status(500).json({ error: 'Error al asignar conductores' });
  }
};

export const obtenerConductores = async (req: Request, res: Response): Promise<any>  => {
  const { idReserva } = req.params;

  try {
    const conductores = await obtenerConductoresService(Number(idReserva));
    res.json(conductores);
  } catch (error) {
    if (error instanceof Error && error.message === 'RESERVA_NO_ENCONTRADA') {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    console.error('[ERROR obtenerConductores]', error);
    res.status(500).json({ error: 'Error al obtener conductores' });
  }
};

export const eliminarConductor = async (req: Request, res: Response): Promise<any>  => {
  const { idReserva, idUsuario } = req.params;

  try {
    await eliminarConductorService(Number(idReserva), Number(idUsuario));
    res.json({ message: 'Conductor eliminado' });
  } catch (error) {
    if (error instanceof Error && error.message === 'RESERVA_NO_ENCONTRADA') {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    console.error('[ERROR eliminarConductor]', error);
    res.status(500).json({ error: 'Error al eliminar conductor' });
  }
};


