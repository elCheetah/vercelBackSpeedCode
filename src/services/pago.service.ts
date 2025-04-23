import { prisma } from '../config/database';
import { MetodoPago } from '@prisma/client';

export const registrarPago = async (
  reserva_idreserva: number,
  monto: number,
  metodo_pago: MetodoPago,
  referencia: string,
  concepto: string
) => {
  try {
    const reservaExistente = await prisma.reserva.findUnique({
      where: { idreserva: reserva_idreserva },
    });

    if (!reservaExistente) {
      throw new Error('La reserva no existe');
    }

    const nuevoPago = await prisma.pago.create({
      data: {
        reserva_idreserva,
        monto,
        metodo_pago,
        referencia,
        detalles: {
          create: {
            concepto,
            monto
          }
        }
      },
      include: {
        detalles: true
      }
    });

    return nuevoPago;

  } catch (error) {
    console.error('Error al crear el pago:', error);
    throw new Error('Error al crear el pago');
  }
};


export const obtenerPagos = async () => {
  try {
    return await prisma.pago.findMany();
  } catch (error) {
    console.error('Error al obtener los pagos:', error);
    throw new Error('Error al obtener los pagos');
  }
};