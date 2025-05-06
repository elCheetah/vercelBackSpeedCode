import { prisma } from '../config/database';
import { calcularDistancia } from '../utils/haversine';

export const obtenerVehiculosCercanos = async (lat: number, lng: number, dkm: number) => {
  const vehiculos = await prisma.vehiculo.findMany({
    where: {
      estado: 'activo',
      disponible: 'sí',
      ubicacion: {
        latitud: { not: null },
        longitud: { not: null }
      }
    },
    include: {
      ubicacion: true
    }
  });

  return vehiculos.filter((v: { ubicacion: { latitud: number | null; longitud: number | null; }; }) =>
    v.ubicacion?.latitud != null &&
    v.ubicacion?.longitud != null &&
    calcularDistancia(lat, lng, v.ubicacion.latitud, v.ubicacion.longitud) <= dkm
  );
};