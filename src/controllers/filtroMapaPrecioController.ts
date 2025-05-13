import { Request, Response } from 'express';
import {
  obtenerVehiculosDisponibles,
  getVehiculoPorId,
  filtrarVehiculos as filtrarVehiculosService,
} from '../services/filtroMapaPrecioService';

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

/*
====================================================================================
================PARA COMBINACIONES DE FILTRADO======================================
*/
export const filtrarVehiculos = async (req: Request, res: Response) : Promise<any>  => {
  try {
    const {
      texto,
      fechaInicio,
      fechaFin,
      lat,
      lng,
      dkm,
      precioMin,
      precioMax,
    } = req.query;

    const vehiculos = await filtrarVehiculosService({
      texto: texto?.toString(),
      fechaInicio: fechaInicio ? new Date(fechaInicio.toString()) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin.toString()) : undefined,
      lat: lat ? parseFloat(lat.toString()) : undefined,
      lng: lng ? parseFloat(lng.toString()) : undefined,
      dkm: dkm ? parseFloat(dkm.toString()) : 5,
      precioMin: precioMin ? parseFloat(precioMin.toString()) : undefined,
      precioMax: precioMax ? parseFloat(precioMax.toString()) : undefined,
    });

    return res.status(200).json({ vehiculos });
  } catch (error: any) {
    console.error(error);
    return res.status(error.status || 500).json({
      error: error.message || 'Error interno del servidor',
    });
  }
};