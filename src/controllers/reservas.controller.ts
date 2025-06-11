import { Request, Response } from 'express';
import { prisma } from '../config/database';

const expirations = new Map<number, NodeJS.Timeout>();

// Crear nueva reserva
export const crearReserva = async (req: Request, res: Response): Promise<any> => {
  console.log('📥 POST /api/reservas recibido');
  try {
    const { renter_idUsuario, auto_idAuto, fecha_inicio, fecha_fin } = req.body;

    const auto = await prisma.auto.findUnique({ where: { idAuto: auto_idAuto } });
    if (!auto) return res.status(404).json({ message: 'Auto no encontrado con ese ID.' });

    const usuario = await prisma.usuario.findUnique({ where: { idUsuario: renter_idUsuario } });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado con ese ID.' });

    const reservaActiva = await prisma.reserva.findFirst({
      where: {
        idCliente: renter_idUsuario,
        estado: 'SOLICITADA',
        fechaLimitePago: { gt: new Date() },
      },
    });

    if (reservaActiva) return res.status(400).json({ message: 'Ya tienes una reserva activa.' });

    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 30);

const reserva = await prisma.reserva.create({
  data: {
    fechaInicio: new Date(fecha_inicio),
    fechaFin: new Date(fecha_fin),
    estado: 'SOLICITADA',
    fechaLimitePago: expiracion,
    montoTotal: auto.precioRentaDiario, // ✅ corregido aquí
    auto: { connect: { idAuto: auto_idAuto } },
    cliente: { connect: { idUsuario: renter_idUsuario } }
  }
});

    console.log(`🔔 Nueva reserva creada. Expira a las ${expiracion.toLocaleTimeString()}`);

    const tiempoHastaExpiracion = expiracion.getTime() - new Date().getTime();
    const notificacionAntes = tiempoHastaExpiracion - 5 * 60 * 1000;

    if (notificacionAntes > 0) {
      const timeout = setTimeout(() => {
        console.log(`⏳ Aviso: Reserva #${reserva.idReserva} expirará en 5 minutos.`);
      }, notificacionAntes);

      expirations.set(reserva.idReserva, timeout);
    }

    res.status(201).json({ message: 'Reserva creada', reserva });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
};

// Confirmar pago
export const confirmarPago = async (req: Request, res: Response): Promise<any> => {
  try {
    const { idreserva } = req.params;

    const reserva = await prisma.reserva.findUnique({ where: { idReserva: parseInt(idreserva) } });
    if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada' });
    if (reserva.estaPagada) return res.status(400).json({ message: 'La reserva ya fue pagada' });

    const actualizada = await prisma.reserva.update({
      where: { idReserva: reserva.idReserva },
      data: { estaPagada: true, estado: 'CONFIRMADA' },
    });

    console.log(`✅ Reserva #${reserva.idReserva} confirmada y pagada.`);
    res.status(200).json({ message: 'Pago confirmado', reserva: actualizada });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
};

// Ver reserva activa
export const verReservaActiva = async (req: Request, res: Response): Promise<any> => {
  try {
    const { idUsuario } = req.params;

    const reserva = await prisma.reserva.findFirst({
      where: {
        idCliente: parseInt(idUsuario),
        estado: 'SOLICITADA',
        fechaLimitePago: { gt: new Date() },
      },
    });

    if (!reserva) return res.status(404).json({ message: 'No hay reservas activas' });

    const ahora = new Date();
    const tiempoRestanteMs = reserva.fechaLimitePago.getTime() - ahora.getTime();
    const minutos = Math.floor(tiempoRestanteMs / 60000);
    const segundos = Math.floor((tiempoRestanteMs % 60000) / 1000);

    res.status(200).json({
      message: 'Reserva activa encontrada',
      idreserva: reserva.idReserva,
      expiracion: reserva.fechaLimitePago.toLocaleString(),
      tiempo_restante: `${minutos} minutos y ${segundos} segundos`,
      reserva,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar la reserva activa' });
  }
};

// Cancelar reservas expiradas
export const cancelarExpiradas = async (_req: Request, res: Response): Promise<any> => {
  try {
    const resultado = await prisma.reserva.updateMany({
      where: { estado: 'SOLICITADA', fechaLimitePago: { lt: new Date() } },
      data: { estado: 'CANCELADA' },
    });

    console.log(`🛑 Reservas expiradas canceladas: ${resultado.count}`);
    res.status(200).json({ message: 'Reservas expiradas canceladas', resultado });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar reservas' });
  }
};

// Cancelar reserva específica
export const cancelarReserva = async (req: Request, res: Response): Promise<any> => {
  const { idreserva } = req.params;
  try {
    const id = parseInt(idreserva);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID de reserva inválido' });
    }

    const reserva = await prisma.reserva.findUnique({
      where: { idReserva: id }
    });

    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    if (reserva.estado !== 'SOLICITADA') {
      return res.status(400).json({ message: 'Solo puedes cancelar reservas en estado SOLICITADA.' });
    }

    const cancelada = await prisma.reserva.update({
      where: { idReserva: id },
      data: {
        estado: 'CANCELADA'
      }
    });

    console.log(`🚫 Reserva #${id} fue cancelada por el usuario.`);
    return res.status(200).json({
      message: '✅ Tu reserva ha sido cancelada correctamente.',
      reserva: cancelada
    });
  } catch (error) {
    console.error('Error al cancelar la reserva:', error);
    return res.status(500).json({ error: 'Error interno al cancelar la reserva.' });
  }
};

// Tiempo restante en memoria
let reservasEnMemoria: { [key: string]: number } = {};

export const obtenerTiempoReserva = async (req: Request, res: Response): Promise<any> => {
  const { idReserva } = req.params;

  try {
    if (!reservasEnMemoria[idReserva]) {
      const tiempoRestanteEnSegundos = 3 * 60 * 60;
      reservasEnMemoria[idReserva] = tiempoRestanteEnSegundos;
      console.log(`Reserva creada para el ID ${idReserva} con 3 horas de duración.`);
    }

    let tiempoRestante = reservasEnMemoria[idReserva];

    if (tiempoRestante <= 0) {
      delete reservasEnMemoria[idReserva];
      return res.json({ success: false, message: "El tiempo de la reserva ya ha expirado." });
    }

    reservasEnMemoria[idReserva] = tiempoRestante - 1;
    const estado = reservasEnMemoria[idReserva] > 0;

    return res.json({
      success: estado,
      tiempoRestante: reservasEnMemoria[idReserva],
    });
  } catch (error) {
    console.error("Error al obtener el tiempo de la reserva:", error);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
};
