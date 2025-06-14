import { prisma } from '../../config/database';
import { Request, Response } from 'express';
import {
  asignarConductoresService,
  obtenerConductoresService,
  eliminarConductorService,
} from '../../services/speedcode/conductoresService';

export const asignarConductores = async (req: Request, res: Response): Promise<any> => {
  console.log('REQ.BODY en producción:', req.body);
  const { idReserva, conductores } = req.body;


  if (!idReserva || !Array.isArray(conductores) || conductores.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚÑñ\s]+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const telefonoRegex = /^[\d.\-]+$/;

  try {
    const idUsuarios: number[] = [];

    for (let i = 0; i < conductores.length; i++) {
      const c = conductores[i];

      if (!soloLetrasRegex.test(c.nombre)) {
        return res.status(400).json({ error: `El nombre del conductor ${i + 1} es inválido.` });
      }
      if (!soloLetrasRegex.test(c.apellido)) {
        return res.status(400).json({ error: `El apellido del conductor ${i + 1} es inválido.` });
      }
      if (!emailRegex.test(c.email)) {
        return res.status(400).json({ error: `El email del conductor ${i + 1} es inválido.` });
      }
      if (!telefonoRegex.test(c.telefono)) {
        return res.status(400).json({ error: `El teléfono del conductor ${i + 1} solo debe tener números.` });
      }

      // Buscar usuario por email
      let usuario = await prisma.usuario.findUnique({
        where: { email: c.email }
      });

      // Crear si no existe
      if (!usuario) {
        usuario = await prisma.usuario.create({
          data: {
            nombreCompleto: `${c.nombre} ${c.apellido}`,
            email: c.email,
            telefono: c.telefono,
            registradoCon: "email", // ajusta si tienes enum
            verificado: false,
          }
        });
      }

      idUsuarios.push(usuario.idUsuario);
    }

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

    if (err.message === 'RESERVA_YA_TIENE_CONDUCTORES') {
      return res.status(400).json({ error: 'La reserva ya tiene conductores asignados.' });
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


