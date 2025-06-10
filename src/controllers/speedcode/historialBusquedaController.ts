import { Request, Response } from "express";
import * as historialService from "../../services/speedcode/historialBusquedaService";

export const obtenerUltimasBusquedas = (req: Request, res: Response): void => {
  const usuarioId = Number(req.query.usuarioId);
  if (!usuarioId) {
    res.status(400).json({ error: "Falta usuarioId" });
    return;
  }

  const resultado = historialService.obtenerUltimasBusquedas(usuarioId);
  res.status(200).json(resultado);
};

export const registrarBusqueda = (req: Request, res: Response): void => {
  const { usuarioId, termino } = req.body;
  if (!usuarioId || !termino) {
    res.status(400).json({ error: "Faltan datos requeridos" });
    return;
  }

  try {
    const resultado = historialService.registrarBusqueda(usuarioId, termino);
    res.status(201).json(resultado);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const autocompletarBusquedas = (req: Request, res: Response): void => {
  const usuarioId = Number(req.query.usuarioId);
  const texto = (req.query.texto as string) || "";
  if (!usuarioId || !texto) {
    res.status(400).json({ error: "Faltan datos" });
    return;
  }

  const sugerencias = historialService.autocompletarBusquedas(usuarioId, texto);
  res.status(200).json(sugerencias);
};

export const eliminarBusqueda = (req: Request, res: Response): void => {
  const { usuarioId, termino } = req.body;
  if (!usuarioId || !termino) {
    res.status(400).json({ error: "Faltan datos requeridos" });
    return;
  }

  const eliminado = historialService.eliminarBusqueda(usuarioId, termino);
  if (eliminado) {
    res.status(200).json({ mensaje: "Búsqueda eliminada correctamente" });
  } else {
    res.status(404).json({ error: "Búsqueda no encontrada" });
  }
};

export const limpiarHistorial = (req: Request, res: Response): void => {
  const { usuarioId } = req.body;
  if (!usuarioId) {
    res.status(400).json({ error: "Falta usuarioId" });
    return;
  }

  const limpiado = historialService.limpiarHistorial(usuarioId);
  if (limpiado) {
    res.status(200).json({ mensaje: "Historial limpiado correctamente" });
  } else {
    res.status(404).json({ error: "No hay historial para limpiar" });
  }
};