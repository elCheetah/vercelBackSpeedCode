import { Request, Response } from 'express';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { generarCodigoComprobante } from './pago.controller';
import { buscarQRPorReserva } from './../middlewares/validarQR';

export const generarQR = async (req: Request, res: Response) => {
  try {
    const { tipo, monto, idReserva } = req.params;

    if (!monto) {
      return res.status(400).json({ error: 'Monto obligatorio para generar QR.' });
    }

    if (!idReserva) {
      return res.status(400).json({ error: 'idReserva obligatorio para generar QR.' });
    }

    if (!tipo || (tipo !== 'crear' && tipo !== 'regenerar')) {
      return res.status(400).json({ error: 'Debe especificar "crear" o "regenerar" en el tipo.' });
    }

    const reservaId = Number(idReserva);
    const tempDir = path.join(__dirname, '..', 'temp');
    const resultado = buscarQRPorReserva(reservaId);

    // Si el tipo es "regenerar", eliminamos los archivos anteriores si existen
    if (tipo === 'regenerar' && resultado.encontrado) {
      const archivoQR = resultado.archivoQR;
      const archivoJSON = resultado.archivoJSON;

      if (archivoQR && archivoJSON) {
        const rutaAnteriorQR = path.join(tempDir, archivoQR);
        const rutaAnteriorJson = path.join(tempDir, archivoJSON);

        try {
          if (fs.existsSync(rutaAnteriorJson)) fs.unlinkSync(rutaAnteriorJson);
          if (fs.existsSync(rutaAnteriorQR)) fs.unlinkSync(rutaAnteriorQR);
          console.log(`Archivos anteriores eliminados: ${rutaAnteriorQR}, ${rutaAnteriorJson}`);
        } catch (err) {
          console.error('Error al eliminar archivos existentes:', err);
        }
      } else {
        console.warn('No se encontraron nombres de archivo para eliminar.');
      }
    }

    // Si se quiere crear y ya existe, no se debe generar nuevamente
    if (tipo === 'crear' && resultado.encontrado) {
      return res.json({
        mensaje: 'QR ya existente para esta reserva',
        archivoQR: resultado.archivoQR,
        archivoJSON: resultado.archivoJSON,
        referencia: resultado.referencia
      });
    }

    // Generamos nueva información de QR
    const referencia = 'QR-' + generarCodigoComprobante();
    const fecha = new Date().toISOString();
    const datos = {
      idReserva,
      referencia,
      monto,
      fecha
    };

    // Asegurar que el directorio temporal exista
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generar nombre base único para los archivos
    const nombreBase = `qr_${Date.now()}`;
    const rutaJson = path.join(tempDir, `${nombreBase}.json`);
    const rutaQR = path.join(tempDir, `${nombreBase}.png`);

    // Guardar archivo JSON
    fs.writeFileSync(rutaJson, JSON.stringify(datos, null, 2), 'utf-8');

    // Contenido del QR que se generará
    const contenidoQR = `idReserva: ${idReserva}, Monto: ${monto}, Referencia: ${referencia}, Fecha: ${fecha}`;

    // Generar archivo QR en formato PNG
    await QRCode.toFile(rutaQR, contenidoQR);

    // Programar eliminación de archivos temporales después de 10 minutos
    setTimeout(() => {
      try {
        if (fs.existsSync(rutaQR)) fs.unlinkSync(rutaQR);
        if (fs.existsSync(rutaJson)) fs.unlinkSync(rutaJson);
        console.log(`Archivos eliminados automáticamente: ${rutaQR}, ${rutaJson}`);
      } catch (err) {
        console.error('Error al eliminar archivos temporales:', err);
      }
    }, 10 * 60 * 1000); // 10 minutos

    // Respuesta exitosa
    return res.json({
      mensaje: 'QR generado correctamente',
      archivoQR: `${nombreBase}.png`,
      archivoJSON: `${nombreBase}.json`,
      referencia
    });

  } catch (error) {
    console.error('Error al generar QR:', error);
    return res.status(500).json({ error: 'Error interno al generar el QR.' });
  }
};
