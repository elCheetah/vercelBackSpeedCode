import { Request, Response } from 'express';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { generarCodigoComprobante } from './pago.controller';
import { buscarQRPorReserva } from './../middlewares/validarQR';

export const generarQR = async (req: Request, res: Response) => {
  try {
    const { tipo, monto, idReserva } = req.params;

    // Validación de parámetros
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

    // Ruta pública donde se guardarán los archivos QR y JSON
    const publicDir = path.join(process.cwd(), 'public', 'qr'); // Carpeta pública accesible

    // Crear directorio si no existe
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Buscar si ya existe un QR asociado a la reserva
    const resultado = await buscarQRPorReserva(reservaId);

    // Si es "regenerar", eliminar QR y JSON anteriores si existen
    if (tipo === 'regenerar' && resultado.encontrado) {
      const rutaQRExistente = path.join(publicDir, resultado.archivoQR || '');
      const rutaJSONExistente = path.join(publicDir, resultado.archivoJSON || '');

      try {
        if (fs.existsSync(rutaQRExistente)) fs.unlinkSync(rutaQRExistente);
        if (fs.existsSync(rutaJSONExistente)) fs.unlinkSync(rutaJSONExistente);
        console.log(`Archivos antiguos eliminados: ${rutaQRExistente}, ${rutaJSONExistente}`);
      } catch (err) {
        console.error('Error al eliminar archivos anteriores:', err);
      }
    }

    // Si es "crear" y ya existe un QR, retornar la información
    if (tipo === 'crear' && resultado.encontrado) {
      const rutaQRExistente = path.join(publicDir, resultado.archivoQR || '');
      let base64 = '';

      if (fs.existsSync(rutaQRExistente)) {
        const buffer = fs.readFileSync(rutaQRExistente);
        base64 = buffer.toString('base64');
      }

      return res.json({
        mensaje: 'QR ya existente para esta reserva',
        archivoQR: resultado.archivoQR,
        archivoJSON: resultado.archivoJSON,
        referencia: resultado.referencia,
        qrBase64: base64
      });
    }

    // Generar nuevo QR
    const referencia = 'QR-' + generarCodigoComprobante();
    const fecha = new Date().toISOString();
    const datos = { idReserva, referencia, monto, fecha };

    const nombreBase = `qr_${Date.now()}`;
    const archivoJson = `${nombreBase}.json`;
    const archivoQRNuevo = `${nombreBase}.png`;

    const rutaJson = path.join(publicDir, archivoJson);
    const rutaQR = path.join(publicDir, archivoQRNuevo);

    // Guardar datos en archivo JSON
    fs.writeFileSync(rutaJson, JSON.stringify(datos, null, 2), 'utf-8');

    const contenidoQR = `idReserva: ${idReserva}, Monto: ${monto}, Referencia: ${referencia}, Fecha: ${fecha}`;

    // Generar el QR
    await QRCode.toFile(rutaQR, contenidoQR);

    // Leer y convertir QR a base64
    const buffer = fs.readFileSync(rutaQR);
    const base64 = buffer.toString('base64');

    // Eliminación automática en 10 minutos
    setTimeout(() => {
      try {
        if (fs.existsSync(rutaQR)) fs.unlinkSync(rutaQR);
        if (fs.existsSync(rutaJson)) fs.unlinkSync(rutaJson);
        console.log(`Archivos eliminados automáticamente: ${rutaQR}, ${rutaJson}`);
      } catch (err) {
        console.error('Error al eliminar archivos temporales:', err);
      }
    }, 3 * 60 * 1000); // 3 minutos

    return res.json({
      mensaje: 'QR generado correctamente',
      archivoQR: archivoQRNuevo,
      archivoJSON: archivoJson,
      referencia,
      qrBase64: base64,
      urlQR: `https://vercelbackspeedcode.onrender.com/qr/${archivoQRNuevo}` // URL pública para acceder al QR
    });

  } catch (error: unknown) {
    console.error('Error al generar QR:', error);
    if (error instanceof Error) {
      return res.status(500).json({
        error: 'Error interno al generar el QR.',
        message: error.message,
        stack: error.stack
      });
    } else {
      return res.status(500).json({
        error: 'Error desconocido al generar el QR.'
      });
    }
  }
};
