// src/controllers/aeropuertoController.ts

import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { getDistanceFromLatLonInKm } from '../utils/distance';

const prisma = new PrismaClient();
const MAX_DISTANCE_KM = 3;

// ====================
// Autocompletar aeropuertos por nombre
// ====================
export const autocompletarAeropuerto = async (req: Request, res: Response): Promise<any> => {
  const { q } = req.query;

  if (typeof q !== 'string' || q.trim() === '') {
    return res.status(400).json({ mensaje: 'Debe ingresar un nombre de aeropuerto.' });
  }

  try {
    const resultados = await prisma.aeropuerto.findMany({
      where: {
        nombre: {
          contains: q,
          mode: 'insensitive',
        },
      },
      take: 5,
      orderBy: {
        nombre: 'asc',
      },
    });

    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron resultados.' });
    }

    return res.json(resultados);
  } catch (error) {
    console.error('Error al buscar aeropuertos:', error);
    return res.status(500).json({ mensaje: 'Error de servidor al buscar aeropuertos.' });
  }
};

// ====================
// Obtener vehículos cercanos a un aeropuerto
// ====================
export const obtenerVehiculosCercanos = async (req: Request, res: Response): Promise<any> => {
  const schema = z.object({
    idAeropuerto: z.coerce.number().int(),
  });

  const parsed = schema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ mensaje: 'Debe proporcionar un ID de aeropuerto válido.' });
  }

  try {
    const aeropuerto = await prisma.aeropuerto.findUnique({
      where: { idaeropuerto: parsed.data.idAeropuerto },
      include: { ubicacion: true },
    });

    if (!aeropuerto || !aeropuerto.ubicacion) {
      return res.status(404).json({ mensaje: 'Aeropuerto o ubicación no encontrada.' });
    }

    const vehiculos = await prisma.vehiculo.findMany({
      where: {
        disponible: "sí",
        ubicacion: {
          latitud: { not: null },
          longitud: { not: null },
        },
      },
      include: { ubicacion: true },
    });

    const vehiculosCercanos = vehiculos
      .map((vehiculo) => {
        const distancia = getDistanceFromLatLonInKm(
          aeropuerto.latitud,
          aeropuerto.longitud,
          vehiculo.ubicacion.latitud ?? 0,
          vehiculo.ubicacion.longitud ?? 0
        );
        return { ...vehiculo, distancia };
      })
      .filter((vehiculo) => vehiculo.distancia <= MAX_DISTANCE_KM)
      .sort((a, b) => a.distancia - b.distancia);

    if (vehiculosCercanos.length === 0) {
      return res.status(200).json({ mensaje: 'No se encontraron vehículos disponibles cerca.' });
    }

    const resultado = vehiculosCercanos.map((vehiculo) => ({
      id: vehiculo.idvehiculo,
      imagen: vehiculo.imagen,
      precio: vehiculo.tarifa,
      distancia: `${vehiculo.distancia.toFixed(2)} km`,
    }));

    return res.json(resultado);
  } catch (error) {
    console.error('Error al obtener vehículos cercanos:', error);
    return res.status(500).json({ mensaje: 'Error al obtener vehículos cercanos.' });
  }
};
