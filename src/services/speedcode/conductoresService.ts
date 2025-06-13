import { prisma } from '../../config/database';

export const asignarConductoresService = async (
  idReserva: number,
  idUsuarios: (string | number)[]
) => {
  // 1. Verificar que exista la reserva
  const reserva = await prisma.reserva.findUnique({ where: { idReserva } });
  if (!reserva) throw new Error('RESERVA_NO_ENCONTRADA');
    // Nueva verificación: si ya tiene conductores asignados

     const driverExistente = await prisma.driver.findUnique({
    where: { idUsuario: reserva.idCliente },
   });

if (driverExistente) {
  const yaAsignados = await prisma.usuarioDriver.findMany({
    where: {
      idDriver: driverExistente.idDriver,
    },
  });

  if (yaAsignados.length > 0) {
    throw new Error('RESERVA_YA_TIENE_CONDUCTORES');
  }
}
  // 2. Buscar o crear el driver basado en el cliente
  let driver = await prisma.driver.findUnique({
    where: { idUsuario: reserva.idCliente },
  });

  if (!driver) {
    // Crear automáticamente el driver con datos por defecto
    driver = await prisma.driver.create({
      data: {
        idUsuario: reserva.idCliente,
        sexo: 'NO DEFINIDO',
        telefono: '00000000',
        licencia: 'LIC-' + reserva.idCliente,
        fechaEmision: new Date(),
        fechaExpiracion: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
        anversoUrl: '',
        reversoUrl: '',
      },
    });
  }

  // 3. Preparar datos de asignación
  const datos = idUsuarios.map((idUsuario) => ({
    idUsuario: Number(idUsuario),
    idDriver: driver.idDriver,
  }));

  // 4. Asignar usando upsert
  const asignaciones = await Promise.all(
    datos.map(async ({ idUsuario, idDriver }) => {
      return prisma.usuarioDriver.upsert({
        where: {
          idUsuario_idDriver: {
            idUsuario,
            idDriver,
          },
        },
        create: {
          idUsuario,
          idDriver,
        },
        update: {},
      });
    })
  );

  return asignaciones;
};


export const obtenerConductoresService = async (idReserva: number) => {
  const reserva = await prisma.reserva.findUnique({
    where: { idReserva },
    include: {
      cliente: {
        include: {
          driversAsignados: {
            include: {
              usuario: true,
            },
          },
        },
      },
    },
  });

  if (!reserva || !reserva.cliente) throw new Error('RESERVA_NO_ENCONTRADA');

  return reserva.cliente.driversAsignados.map((a) => a.usuario);
};

export const eliminarConductorService = async (idReserva: number, idUsuario: number) => {
  const reserva = await prisma.reserva.findUnique({ where: { idReserva } });
  if (!reserva) throw new Error('RESERVA_NO_ENCONTRADA');

  await prisma.usuarioDriver.delete({
    where: {
      idUsuario_idDriver: {
        idUsuario,
        idDriver: Number(reserva.idCliente),
      },
    },
  });
};
