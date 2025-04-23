import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerTopVehiculos = async () => {
  const resultado = await prisma.vehiculo.findMany({
    select: {
      idvehiculo: true,
      marca: true,
      imagen: true,
      placa: true,
      descripcion: true,
      modelo: true,
      tarifa: true,
      color: true,
      calificaciones: {
        select: {
          puntuacion: true,
        },
      },
    },
  });

  // Procesar promedios
  const vehiculosConPromedio = resultado
    .map((vehiculo) => {
      const total = vehiculo.calificaciones.reduce((acc, val) => acc + val.puntuacion, 0);
      const cantidad = vehiculo.calificaciones.length;
      const promedio = cantidad > 0 ? parseFloat((total / cantidad).toFixed(2)) : 0;

      return {
        idvehiculo: vehiculo.idvehiculo,
        imagen:vehiculo.imagen,
        placa: vehiculo.placa,
        descripcion: vehiculo.descripcion,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        tarifa: vehiculo.tarifa,
        color: vehiculo.color,
        promedio_calificacion: promedio,
      };
    })
    .sort((a, b) => b.promedio_calificacion - a.promedio_calificacion)
    .slice(0, 5); // Top 5

  return vehiculosConPromedio;
};


export const obtenerVehiculoConReserva = async (idvehiculo: number) => {
  const vehiculo = await prisma.vehiculo.findUnique({
    where: { idvehiculo },
    select: {
      idvehiculo: true,
      imagen: true,
      placa: true,
      descripcion: true,
      marca: true,
      modelo: true,
      tarifa: true,
      reservas: {
        orderBy: { fecha_creacion: "desc" },
        take: 1, // Última reserva
        select: {
          fecha_inicio: true,
          fecha_fin: true,
          idreserva: true,
          estado: true,
          pagado: true,
        },
      },
    },
  });

  if (!vehiculo) {
    throw new Error("Vehículo no encontrado");
  }

  return {
    idvehiculo: vehiculo.idvehiculo,
    imagen: vehiculo.imagen,
    placa: vehiculo.placa,
    descripcion: vehiculo.descripcion,
    marca: vehiculo.marca,
    modelo: vehiculo.modelo,
    tarifa: vehiculo.tarifa,
    incluido_en_reserva: vehiculo.reservas.length > 0,
    reserva: vehiculo.reservas[0] ?? null,
  };
};