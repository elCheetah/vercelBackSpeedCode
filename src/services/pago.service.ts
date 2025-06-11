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
    // Buscar la reserva y su registro de pagos
    const reserva = await prisma.reserva.findUnique({
      where: { idReserva: reserva_idreserva },
      include: { registroPagos: true }
    });

    if (!reserva) {
      throw new Error('La reserva no existe');
    }

let registro = reserva.registroPagos;

if (!registro) {
registro = await prisma.registroPagos.create({
  data: {
    idReserva: reserva_idreserva,
    montoTotal: monto,
    concepto, // ✅ ahora sí cumple con el esquema de Prisma
  }
});
}


    const nuevoPago = await prisma.pago.create({
      data: {
         idRegistroPagos: registro.idRegistroPagos, // ✅ Correcto según tu modelo
        monto,
        metodoPago: metodo_pago,
        referencia,
        tipo: 'RENTA' // o 'GARANTIA' si deseas diferenciarlo
        // NOTA: la lógica de garantía adicional debe hacerse aparte
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

// Asegura que TypeScript lo trate como módulo
export {};
