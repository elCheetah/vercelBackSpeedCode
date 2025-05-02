import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calcularDistanciaKm } from '../utils/geo';

const prisma = new PrismaClient();

// Radio por defecto (50 km)
const RADIO_DEFAULT_KM = 50;

export const buscarVehiculosCercanos = async (req: Request, res: Response) => {
  try {
    const { lat, lon, radio } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ mensaje: 'Latitud y longitud son requeridas.' });
    }

    const latNum = parseFloat(lat as string);
    const lonNum = parseFloat(lon as string);
    const radioKm = radio ? parseFloat(radio as string) : RADIO_DEFAULT_KM;

    // Obtener todos los vehículos disponibles y sus ubicaciones
    const vehiculos = await prisma.vehiculo.findMany({
      where: { disponible: 'sí' },
      include: {
        ubicacion: true,
      },
    });

    // Filtrar los que están dentro del radio
    const vehiculosCercanos = vehiculos
      .map((vehiculo) => {
        const ubicacion = vehiculo.ubicacion;
        if (!ubicacion.latitud || !ubicacion.amplitud) return null;

        const distancia = calcularDistanciaKm(
          latNum,
          lonNum,
          ubicacion.latitud,
          ubicacion.amplitud
        );

        if (distancia <= radioKm) {
          return {
            id: vehiculo.idvehiculo,
            marca: vehiculo.marca,
            modelo: vehiculo.modelo,
            imagen: vehiculo.imagen,
            precio: vehiculo.tarifa,
            disponible: vehiculo.disponible,
            distancia: parseFloat(distancia.toFixed(2)),
          };
        }

        return null;
      })
      .filter(Boolean) // quitar nulls
      .sort((a, b) => (a!.distancia > b!.distancia ? 1 : -1)); // ordenar por distancia

    if (vehiculosCercanos.length === 0) {
      return res.json({ mensaje: 'No se encontraron coches disponibles cerca de esta ubicación.', resultados: [] });
    }

    return res.json({ resultados: vehiculosCercanos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: 'Error al buscar vehículos cercanos.' });
  }
};
