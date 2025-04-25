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
