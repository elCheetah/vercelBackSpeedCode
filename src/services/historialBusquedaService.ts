import { prisma } from '../config/database';

const LIMITE_HISTORIAL = 15;

export const obtenerUltimasBusquedas = async (usuarioId: number, limite: number = 5) => {
  return await prisma.historialBusqueda.findMany({
    where: { usuario_idusuario: usuarioId },
    orderBy: { creado_en: 'desc' },
    take: limite,
  });
};

export const registrarBusqueda = async (usuarioId: number, termino: string, filtros?: any) => {
  const terminoNormalizado = termino.toLowerCase().trim();

  if (terminoNormalizado.length > 100) {
    throw new Error('El término de búsqueda no debe superar los 100 caracteres.');
  }

  const busquedaExistente = await prisma.historialBusqueda.findFirst({
    where: {
      usuario_idusuario: usuarioId,
      termino_busqueda: terminoNormalizado,
    },
  });

  if (busquedaExistente) {
    return await prisma.historialBusqueda.update({
      where: { id: busquedaExistente.id },
      data: { creado_en: new Date() },
    });
  } else {
    const total = await prisma.historialBusqueda.count({
      where: { usuario_idusuario: usuarioId },
    });

    if (total >= LIMITE_HISTORIAL) {
      const masAntigua = await prisma.historialBusqueda.findFirst({
        where: { usuario_idusuario: usuarioId },
        orderBy: { creado_en: 'asc' },
      });

      if (masAntigua) {
        await prisma.historialBusqueda.delete({ where: { id: masAntigua.id } });
      }
    }

    return await prisma.historialBusqueda.create({
      data: {
        usuario_idusuario: usuarioId,
        termino_busqueda: terminoNormalizado,
        filtros,
      },
    });
  }
};

export const autocompletarBusquedas = async (usuarioId: number, texto: string) => {
  return await prisma.historialBusqueda.findMany({
    where: {
      usuario_idusuario: usuarioId,
      termino_busqueda: {
        contains: texto.toLowerCase(),
      },
    },
    orderBy: {
      creado_en: 'desc',
    },
    take: 5,
  });
};
