import { prisma } from '../config/database';

export const filtroFechasService = {
  /**
   * Find vehicles that are available within a specific date range
   * A vehicle is available if:
   * 1. It has disponible = "sí" and estado = "activo"
   * 2. It doesn't have any reservations that overlap with the requested date range
   */
  async buscarVehiculosDisponibles(fechaInicio: Date, fechaFin: Date) {
    // Find active vehicles that don't have overlapping reservations
    const vehiculosDisponibles = await prisma.vehiculo.findMany({
      where: {
        disponible: "sí",
        estado: "activo",
        // Check that no reservation overlaps with the requested date range
        NOT: {
          reservas: {
            some: {
              // A reservation overlaps if:
              // 1. It starts before the end date AND ends after the start date
              // 2. It's not in a cancelled state
              AND: [
                {
                  OR: [
                    {
                      fecha_inicio: {
                        lte: fechaFin,
                      },
                      fecha_fin: {
                        gte: fechaInicio,
                      }
                    }
                  ]
                },
                {
                  NOT: {
                    estado: "cancelado"
                  }
                }
              ]
            }
          }
        }
      },
      include: {
        ubicacion: true,
        renter: {
          select: {
            idrenter: true,
            nombre_completo: true,
            correo: true,
            telefono: true,
          }
        }
      }
    });
    
    return vehiculosDisponibles;
  }
};