import { Request, Response } from 'express';
import { filtroFechasService } from '../services/filtroXFechasService';

export const filtroFechasController = {
  /**
   * Get vehicles available for a specific date range
   * @param req Request with startDate and endDate query parameters
   * @param res Response object
   */
  async getVehiculosDisponiblesPorFecha(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin } = req.query;
      
      // Validate if dates are provided
      if (!fechaInicio || !fechaFin) {
        res.status(400).json({ 
          success: false, 
          message: 'Tanto fechaInicio como fechaFin son obligatorios' 
        });
        return;
      }

      // Validate date format (YYYY-MM-DD)
      if (!esFechaValida(fechaInicio as string) || !esFechaValida(fechaFin as string)) {
        res.status(400).json({ 
          success: false, 
          message: 'Las fechas deben tener el formato YYYY-MM-DD' 
        });
        return;
      }

      // Convert string dates to Date objects
      const inicio = new Date(fechaInicio as string);
      const fin = new Date(fechaFin as string);
      
      // Validate date range
      const validationError = validarRangoFechas(inicio, fin);
      if (validationError) {
        res.status(400).json({ 
          success: false, 
          message: validationError 
        });
        return;
      }

      // Get available vehicles within the date range
      const vehiculos = await filtroFechasService.buscarVehiculosDisponibles(inicio, fin);
      
      res.status(200).json({
        success: true,
        data: vehiculos
      });
    } catch (error) {
      console.error('Error al buscar vehículos disponibles:', error);
      res.status(500).json({ 
        success: false, 
        message: 'No se pudieron obtener los vehículos disponibles. Intenta nuevamente más tarde.' 
      });
    }
  }
};

/**
 * Validates that the date range meets the requirements:
 * - startDate must not be less than current date
 * - endDate must not be more than 12 months from current date
 * - startDate must be before endDate
 */
function validarRangoFechas(fechaInicio: Date, fechaFin: Date): string | null {
  const ahora = new Date();
  ahora.setHours(0, 0, 0, 0); // Reset hours to start of day
  
  const fechaMaxima = new Date();
  fechaMaxima.setMonth(fechaMaxima.getMonth() + 12); // Add 12 months to current date
  
  if (fechaInicio < ahora) {
    return 'La fecha de inicio no puede ser anterior a la fecha actual';
  }
  
  if (fechaFin > fechaMaxima) {
    return 'La fecha de fin no puede ser más de 12 meses en el futuro';
  }
  
  if (fechaInicio > fechaFin) {
    return 'La fecha de inicio debe ser anterior a la fecha de fin';
  }
  
  return null; // No errors
}

/**
 * Validates that the input string is a valid date in YYYY-MM-DD format
 */
function esFechaValida(fecha: string): boolean {
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  return fechaRegex.test(fecha) && !isNaN(new Date(fecha).getTime());
}
