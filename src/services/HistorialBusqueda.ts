import { prisma } from '../config/database';
export const obtenerUltimasBusquedas = async (usuarioId: number, limite: number = 10) => {
  return await prisma.historialBusqueda.findMany({
    where: {
      usuario_idusuario: usuarioId,
    },
    orderBy: {
      creado_en: 'desc',
    },
    take: limite,
  });
};