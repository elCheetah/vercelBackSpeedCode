import { prisma } from '../config/database';
import { isWithinInterval } from 'date-fns';


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

/*
====================================================================================
================PARA COMBINACIONES DE FILTRADO======================================
*/

interface FiltroVehiculo {
  texto?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  lat?: number;
  lng?: number;
  dkm?: number;
  precioMin?: number;
  precioMax?: number;
}

export const filtrarVehiculos = async (filtro: FiltroVehiculo) => {
  const {
    texto,
    fechaInicio,
    fechaFin,
    lat,
    lng,
    dkm = 5,
    precioMin,
    precioMax
  } = filtro;

  if (fechaInicio && fechaFin && fechaInicio >= fechaFin) {
    const error: any = new Error("La fecha de inicio debe ser menor que la fecha de fin.");
    error.status = 400;
    throw error;
  }

  const vehiculos = await prisma.vehiculo.findMany({
    where: {
      disponible: 'sí',
      estado: 'activo',
      tarifa: {
        ...(precioMin !== undefined ? { gte: precioMin } : {}),
        ...(precioMax !== undefined ? { lte: precioMax } : {}),
      },
      OR: texto
        ? [
          { modelo: { contains: texto, mode: 'insensitive' } },
          { marca: { contains: texto, mode: 'insensitive' } },
        ]
        : undefined,
      ubicacion: lat && lng
        ? {
          latitud: { not: null },
          longitud: { not: null },
        }
        : undefined,
    },
    include: {
      ubicacion: true,
      reservas: true,
      renter: true,
      calificaciones: true,
    },
  });

  const filtrado = vehiculos.filter(v => {
    // Validar distancia
    if (
      lat !== undefined &&
      lng !== undefined &&
      v.ubicacion?.latitud !== null &&
      v.ubicacion?.longitud !== null
    ) {
      const distancia = calcularDistancia(lat, lng, v.ubicacion.latitud, v.ubicacion.longitud);
      if (distancia > dkm) return false;
    }

    // Validar fechas
    if (fechaInicio && fechaFin) {
      const reservado = v.reservas.some(r => {
        return (
          isWithinInterval(fechaInicio, { start: r.fecha_inicio, end: r.fecha_fin }) ||
          isWithinInterval(fechaFin, { start: r.fecha_inicio, end: r.fecha_fin }) ||
          (fechaInicio <= r.fecha_inicio && fechaFin >= r.fecha_fin)
        );
      });
      if (reservado) return false;
    }

    return true;
  });

  return {
    cantidad: filtrado.length,
    vehiculos: filtrado,
  };
};

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}