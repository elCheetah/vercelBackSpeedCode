import { prisma } from '../config/database';

export const obtenerVehiculosDisponibles = async () => {
  const vehiculos = await prisma.vehiculo.findMany({
    where: {
      disponible: "sí",
    },
    orderBy: {
      idvehiculo: 'asc',
    },
    select: {
      idvehiculo: true,
      tarifa: true,
      ubicacion: {
        select: {
          latitud: true,
          longitud: true,
        },
      },
    },
  });
  return vehiculos.map(v => ({
    idVehiculo: v.idvehiculo,
    precio: v.tarifa,
    latitud: v.ubicacion?.latitud,
    amplitud: v.ubicacion?.longitud,
  }));
};

export const getVehiculoPorId = async (id: number) => {
  const v = await prisma.vehiculo.findUnique({
    where: {
      idvehiculo: id,
    },
    include: {
      calificaciones: {
        select: {
          puntuacion: true,
        },
      },
    },
  });

  if (!v) return null;

  const calificaciones = v.calificaciones || [];
  const promedio =
    calificaciones.length > 0
      ? calificaciones.reduce((acc, c) => acc + c.puntuacion, 0) / calificaciones.length
      : null;

  return {
    id: v.idvehiculo,
    imagen: v.imagen,
    nombre: `${v.marca} - ${v.modelo}`,
    descripcion: v.descripcion,
    precio: v.tarifa,
    calificacion: promedio,
  };
};