import { prisma } from '../config/database';

// Configuración para la distancia máxima en km
const MAX_DISTANCE_KM = 3;

export async function autocompletarAeropuertoService(q: string) {
  const resultados = await prisma.aeropuerto.findMany({
    where: {
      nombre: {
        contains: q,  // Buscar coincidencias parciales
        mode: 'insensitive',  // Ignorar mayúsculas y minúsculas
      },
    },
    take: 5,  // Limitar a los primeros 5 resultados
    orderBy: {
      nombre: 'asc',  // Ordenar por nombre ascendentemente
    },
    include: {
      ubicacion: true,  // Incluir la ubicación en los resultados
    },
  });

  return resultados;  // Devolver los resultados encontrados
}

export async function obtenerVehiculosCercanosService(idAeropuerto: number) {
  const aeropuerto = await prisma.aeropuerto.findUnique({
    where: { idaeropuerto: idAeropuerto },
    include: { ubicacion: true },
  });

  if (!aeropuerto || !aeropuerto.ubicacion || aeropuerto.ubicacion.latitud == null || aeropuerto.ubicacion.longitud == null) {
    throw new Error('Aeropuerto o ubicación no encontrada.');
  }

  const vehiculos = await prisma.vehiculo.findMany({
    where: {
      disponible: "sí",  // Filtrar por vehículos disponibles
      ubicacion: {
        latitud: { not: null },
        longitud: { not: null },
      },
    },
    include: { ubicacion: true },
  });

  // Calcular la distancia de cada vehículo y filtrar por la distancia máxima
  const vehiculosCercanos = vehiculos
    .map((vehiculo) => {
      const distancia = getDistanceFromLatLonInKm(
        aeropuerto.ubicacion.latitud!,
        aeropuerto.ubicacion.longitud!,
        vehiculo.ubicacion.latitud!,
        vehiculo.ubicacion.longitud!
      );
      return { ...vehiculo, distancia };
    })
    .filter((vehiculo) => vehiculo.distancia <= MAX_DISTANCE_KM)
    .sort((a, b) => a.distancia - b.distancia);

  // Devolver la lista de vehículos cercanos
  return vehiculosCercanos.map((vehiculo) => ({
    id: vehiculo.idvehiculo,
    imagen: vehiculo.imagen,
    precio: vehiculo.tarifa,
    distancia: `${vehiculo.distancia.toFixed(2)} km`,
  }));
}

// Función para calcular la distancia entre dos puntos geográficos (en km)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;  // Radio de la Tierra en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;  // Retorna la distancia en km
}

// Función auxiliar para convertir grados a radianes
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
