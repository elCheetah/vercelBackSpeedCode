import { prisma } from '../config/database';
import { isBefore, addMonths } from 'date-fns';

export async function getAvailableVehiclesByDate(startDate: Date, endDate: Date) {
  const now = new Date();

  if (isBefore(startDate, now)) {
    throw new Error('La fecha de inicio no puede ser menor a hoy.');
  }

  if (isBefore(endDate, startDate)) {
    throw new Error('La fecha fin no puede ser menor a la fecha de inicio.');
  }

  const maxDate = addMonths(now, 12);
  if (endDate > maxDate) {
    throw new Error('El rango de fechas no puede exceder los 12 meses desde hoy.');
  }

  const availableVehicles = await prisma.vehiculo.findMany({
    where: {
      disponible: "sí",
      estado: "activo",
      reservas: {
        none: {
          OR: [
            {
              fecha_inicio: { lte: endDate },
              fecha_fin: { gte: startDate }
            }
          ]
        }
      }
    }
  });

  return availableVehicles;
}
