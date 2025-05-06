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

  // Filtra vehículos con latitud y longitud válidas
  return vehiculos
    .filter(v => v.ubicacion?.latitud !== null && v.ubicacion?.longitud !== null)
    .map(v => ({
      idVehiculo: v.idvehiculo,
      precio: v.tarifa,
      latitud: v.ubicacion!.latitud!,
      amplitud: v.ubicacion!.longitud!,
    }));
};

export const getVehiculoPorId = async (id: number) => {
  const v = await prisma.vehiculo.findUnique({
    where: {
      idvehiculo: id,
    },
    select: {
      idvehiculo: true,
      imagen: true,
      marca: true,
      modelo: true,
      descripcion: true,
      tarifa: true
    }
  });

  if (!v) return null;

  return {
    id: v.idvehiculo,
    imagen: v.imagen,
    nombre: `${v.marca} - ${v.modelo}`,
    descripcion: v.descripcion,
    precio: v.tarifa
  };
};

