import prisma from '../prisma/client'; // Ajusta la ruta si es necesario
import { calcularDistancia } from '../utils/haversine';

export async function obtenerAutosCercanos(lat: number, lon: number, dkm: number) {
  const vehiculos = await prisma.vehiculo.findMany({
    where: {
      disponible: "sí",
      estado: "activo",
      ubicacion: {
        latitud: { not: null },
        amplitud: { not: null },
      }
    },
    include: {
      ubicacion: true
    }
  });

  return vehiculos.filter((v: { ubicacion: { latitud: number; amplitud: number; }; }) => {
    const dist = calcularDistancia(lat, lon, v.ubicacion.latitud!, v.ubicacion.amplitud!);
    return dist <= dkm;
  });
}
