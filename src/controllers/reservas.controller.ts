/*import { Request, Response } from 'express';
import { prisma } from '../config/database';


const expirations = new Map<number, NodeJS.Timeout>();

// Crear nueva reserva
export const crearReserva = async (req: Request, res: Response) : Promise<any> => {
    console.log('📥 POST /api/reservas recibido');
    try {
        const { renter_idrenter, vehiculo_idvehiculo, fecha_inicio, fecha_fin } = req.body;

        const vehiculo = await prisma.vehiculo.findUnique({ where: { idvehiculo: vehiculo_idvehiculo } });
        if (!vehiculo) return res.status(404).json({ message: 'Vehículo no encontrado con ese ID.' });

        const renter = await prisma.renter.findUnique({ where: { idrenter: renter_idrenter } });
        if (!renter) return res.status(404).json({ message: 'Renter no encontrado con ese ID.' });

        const reservaActiva = await prisma.reserva.findFirst({
            where: {
                renter_idrenter,
                estado: 'pendiente',
                expiracion: { gt: new Date() },
            },
        });

        if (reservaActiva) return res.status(400).json({ message: 'Ya tienes una reserva activa.' });

        const expiracion = new Date();
        expiracion.setMinutes(expiracion.getMinutes() + 30);

        const reserva = await prisma.reserva.create({
            data: {
                renter: { connect: { idrenter: renter_idrenter } },
                vehiculo: { connect: { idvehiculo: vehiculo_idvehiculo } },
                fecha_inicio: new Date(fecha_inicio),
                fecha_fin: new Date(fecha_fin),
                estado: 'pendiente',
                expiracion,
            },
        });

        console.log(`🔔 Nueva reserva creada. Expira a las ${expiracion.toLocaleTimeString()}`);

        const tiempoHastaExpiracion = expiracion.getTime() - new Date().getTime();
        const notificacionAntes = tiempoHastaExpiracion - (5 * 60 * 1000);

        if (notificacionAntes > 0) {
            const timeout = setTimeout(() => {
                console.log(`⏳ Aviso: Reserva #${reserva.idreserva} expirará en 5 minutos.`);
            }, notificacionAntes);

            expirations.set(reserva.idreserva, timeout);
        }

        res.status(201).json({ message: 'Reserva creada', reserva });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la reserva' });
    }
};

// Confirmar pago
export const confirmarPago = async (req: Request, res: Response)  : Promise<any> => {
    try {
        const { idreserva } = req.params;

        const reserva = await prisma.reserva.findUnique({ where: { idreserva: parseInt(idreserva) } });
        if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada' });
        if (reserva.pagado) return res.status(400).json({ message: 'La reserva ya fue pagada' });

        const actualizada = await prisma.reserva.update({
            where: { idreserva: reserva.idreserva },
            data: { pagado: true, estado: 'confirmada' },
        });

        console.log(`✅ Reserva #${reserva.idreserva} confirmada y pagada.`);
        res.status(200).json({ message: 'Pago confirmado', reserva: actualizada });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar el pago' });
    }
};

// Ver reserva activa
export const verReservaActiva = async (req: Request, res: Response)  : Promise<any> => {
    try {
        const { idrenter } = req.params;

        const reserva = await prisma.reserva.findFirst({
            where: {
                renter_idrenter: parseInt(idrenter),
                estado: 'pendiente',
                expiracion: { gt: new Date() },
            },
        });

        if (!reserva) return res.status(404).json({ message: 'No hay reservas activas' });

        const ahora = new Date();
        const tiempoRestanteMs = reserva.expiracion.getTime() - ahora.getTime();
        const minutos = Math.floor(tiempoRestanteMs / 60000);
        const segundos = Math.floor((tiempoRestanteMs % 60000) / 1000);

        res.status(200).json({
            message: 'Reserva activa encontrada',
            idreserva: reserva.idreserva,
            expiracion: reserva.expiracion.toLocaleString(),
            tiempo_restante: `${minutos} minutos y ${segundos} segundos`,
            reserva,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar la reserva activa' });
    }
};

// Cancelar reservas expiradas
export const cancelarExpiradas = async (_req: Request, res: Response)  : Promise<any> => {
    try {
        const resultado = await prisma.reserva.updateMany({
            where: { estado: 'pendiente', expiracion: { lt: new Date() } },
            data: { estado: 'cancelada' },
        });

        console.log(`🛑 Reservas expiradas canceladas: ${resultado.count}`);
        res.status(200).json({ message: 'Reservas expiradas canceladas', resultado });
    } catch (error) {
        res.status(500).json({ error: 'Error al cancelar reservas' });
    }
};

export const cancelarReserva = async (req: Request, res: Response): Promise<any> => {
    const { idreserva } = req.params;
    try {
        

        // Validación del parámetro
        const id = parseInt(idreserva);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID de reserva inválido' });
        }

        // Buscar la reserva
        const reserva = await prisma.reserva.findUnique({
            where: { idreserva: id }
        });

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        if (reserva.estado !== 'pendiente') {
            return res.status(400).json({ message: 'Solo puedes cancelar reservas pendientes.' });
        }

        // Actualizar estado a cancelada
        const cancelada = await prisma.reserva.update({
            where: { idreserva: id },
            data: {
                estado: 'cancelada'
                // `ultima_modificacion` se actualizará automáticamente por `@updatedAt`
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


let reservasEnMemoria: { [key: string]: number } = {}; // Usamos el ID como clave y el tiempo restante en segundos como valor

export const obtenerTiempoReserva = async (req: Request, res: Response): Promise<any> => {
  const { idReserva } = req.params;  // Obtenemos el parámetro de la ruta

  try {
    // Si la reserva no existe en memoria, generar una nueva con 3 horas de tiempo
    if (!reservasEnMemoria[idReserva]) {
      const tiempoRestanteEnSegundos = 3 * 60 * 60; // 3 horas en segundos
      reservasEnMemoria[idReserva] = tiempoRestanteEnSegundos;
      console.log(`Reserva creada para el ID ${idReserva} con 3 horas de duración.`);
    }

    // Descontamos el tiempo restante (esto se hace cada vez que se consulta)
    let tiempoRestante = reservasEnMemoria[idReserva];

    // Si el tiempo restante es 0 o menor, eliminamos la reserva
    if (tiempoRestante <= 0) {
      delete reservasEnMemoria[idReserva]; // Elimina la reserva de la memoria
      return res.json({ success: false, message: "El tiempo de la reserva ya ha expirado." });
    }

    // Descontamos un segundo cada vez que se consulta
    reservasEnMemoria[idReserva] = tiempoRestante - 1;

    // Verificar el estado (si el tiempo sigue siendo positivo o no)
    const estado = reservasEnMemoria[idReserva] > 0;

    return res.json({
      success: estado, // Devuelve true si el tiempo restante es positivo, false si ha llegado a 0
      tiempoRestante: reservasEnMemoria[idReserva], // El tiempo restante en segundos
    });

  } catch (error) {
    console.error("Error al obtener el tiempo de la reserva:", error);
    return res.status(500).json({ success: false, message: "Error del servidor" });
  }
};
*/