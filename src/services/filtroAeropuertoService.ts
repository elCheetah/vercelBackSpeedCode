import { prisma } from '../config/database';

const MAX_DISTANCE_KM = 5;

export async function autocompletarAeropuertoService(q: string) {
  const resultados = await prisma.aeropuerto.findMany({
    where: {
      nombre: {
        contains: q,
        mode: 'insensitive',
      },
    },
    take: 15,
    orderBy: {
      nombre: 'asc',
    },
    include: {
      ubicacion: {
        select: {
          ciudad: true,
          pais: true,
          latitud: true,
          longitud: true,
        },
      },
    },
  });

  const transformados = resultados.map((aeropuerto) => ({
    id: aeropuerto.idaeropuerto,
    nombre: aeropuerto.nombre,
    codigo: aeropuerto.codigo,
    ciudad: aeropuerto.ubicacion?.ciudad || '',
    pais: aeropuerto.ubicacion?.pais || '',
    latitud: aeropuerto.ubicacion?.latitud ?? null,
    longitud: aeropuerto.ubicacion?.longitud ?? null,
  }));

  console.log('Aeropuertos devueltos:', transformados.length);
  return transformados;
}

export async function obtenerVehiculosCercanosService(idAeropuerto: number) {
  const aeropuerto = await prisma.aeropuerto.findUnique({
    where: { idaeropuerto: idAeropuerto },
    include: {
      ubicacion: {
        select: {
          latitud: true,
          longitud: true,
        },
      },
    },
  });

  if (
    !aeropuerto ||
    !aeropuerto.ubicacion ||
    aeropuerto.ubicacion.latitud == null ||
    aeropuerto.ubicacion.longitud == null
  ) {
    throw new Error('Aeropuerto o ubicación no encontrada.');
  }

  const { latitud: lat1, longitud: lon1 } = aeropuerto.ubicacion;

  const vehiculos = await prisma.vehiculo.findMany({
    where: {
      disponible: 'sí',
      ubicacion: {
        latitud: { not: null },
        longitud: { not: null },
      },
    },
    include: {
      ubicacion: {
        select: {
          latitud: true,
          longitud: true,
        },
      },
    },
  });

  const vehiculosCercanos = vehiculos
    .map((vehiculo) => {
      const lat2 = vehiculo.ubicacion?.latitud!;
      const lon2 = vehiculo.ubicacion?.longitud!;
      const distancia = getDistanceFromLatLonInKm(lat1!, lon1!, lat2, lon2);
      return { ...vehiculo, distancia };
    })
    .filter((vehiculo) => vehiculo.distancia <= MAX_DISTANCE_KM)
    .sort((a, b) => a.distancia - b.distancia);

  return vehiculosCercanos.map((vehiculo) => ({
    id: vehiculo.idvehiculo,
    imagen: vehiculo.imagen,
    precio: vehiculo.tarifa,
    distancia: `${vehiculo.distancia.toFixed(2)} km`,
    latitud: vehiculo.ubicacion?.latitud ?? null,
    longitud: vehiculo.ubicacion?.longitud ?? null,
  }));
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
