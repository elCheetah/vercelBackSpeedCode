import { Request, Response } from 'express';
import { obtenerTopVehiculos, obtenerVehiculoConReserva } from '../services/vehiculoService';

export const getTopVehiculos = async (_req: Request, res: Response): Promise<any> => {
  try {
    const data = await obtenerTopVehiculos();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener los vehículos:', error);
    res.status(500).json({ error: 'Error al obtener los vehículos con mejor calificación' });
  }
};

export const getVehiculoConReserva = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const idvehiculo = parseInt(id);
    if (isNaN(idvehiculo)) {
      return res.status(400).json({ error: "ID de vehículo no válido" });
    }

    const vehiculoConReserva = await obtenerVehiculoConReserva(idvehiculo);

    res.status(200).json({
      success: true,
      data: vehiculoConReserva,
    });
  } catch (error: any) {
    console.error("Error al obtener el vehículo:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor",
    });
  }
};
