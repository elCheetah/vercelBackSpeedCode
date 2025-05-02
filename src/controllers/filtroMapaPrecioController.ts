import { Request, Response } from 'express';
import {obtenerVehiculosDisponibles, getVehiculoPorId} from '../services/filtroMapaPrecioService';

export const getVehiculosDisponibles = async (req: Request, res: Response): Promise<any> => {
  try {
    const vehiculos = await obtenerVehiculosDisponibles();
    res.json(vehiculos);
  } catch (error) {
    console.error('Error al obtener vehículos disponibles:', error);
    res.status(500).json({ mensaje: 'Error al obtener los vehículos' });
  }
};

export const obtenerVehiculoPorId = async (req: Request, res: Response): Promise<any>  => {
  const id = Number(req.params.id);
  try {
    const vehiculo = await getVehiculoPorId(id);
    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.status(200).json(vehiculo);
  } catch (error) {
    console.error('Error al obtener el vehículo:', error);
    res.status(500).json({ error: 'Error al obtener el vehículo' });
  }
};

