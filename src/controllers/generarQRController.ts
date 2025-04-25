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
    
    // Determinar el directorio temporal dependiendo del entorno
    const tempDir =
      process.env.NODE_ENV === 'production'
        ? '/tmp'  // Usar el directorio temporal del sistema en producción
        : path.join(__dirname, '../temp'); // En desarrollo, lo mantenemos en un directorio relativo
    
    console.log('Directorio temporal:', tempDir);


    // Asegurar que la carpeta temp exista
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Buscar si ya existe un QR para la reserva
    const resultado = await buscarQRPorReserva(reservaId);

    // Si es una solicitud de regeneración y el QR existe, eliminar los archivos anteriores
    if (tipo === 'regenerar' && resultado.encontrado) {
      const rutaQRExistente = path.join(tempDir, resultado.archivoQR || '');
      const rutaJSONExistente = path.join(tempDir, resultado.archivoJSON || '');

      try {
        if (fs.existsSync(rutaQRExistente)) fs.unlinkSync(rutaQRExistente);
        if (fs.existsSync(rutaJSONExistente)) fs.unlinkSync(rutaJSONExistente);
        console.log(`Archivos anteriores eliminados: ${rutaQRExistente}, ${rutaJSONExistente}`);
      } catch (err) {
        console.error('Error al eliminar archivos existentes:', err);
      }
    }

    // Si es una solicitud para crear y el QR ya existe, devolver la información
    if (tipo === 'crear' && resultado.encontrado) {
      const rutaQRExistente = path.join(tempDir, resultado.archivoQR || '');
      let base64 = '';

      if (fs.existsSync(rutaQRExistente)) {
        const buffer = fs.readFileSync(rutaQRExistente);
        base64 = buffer.toString('base64');
      }

      return res.json({
        mensaje: 'QR ya existente para esta reserva',
        archivoQR: `${resultado.archivoQR}`,
        archivoJSON: `${resultado.archivoJSON}`,
        referencia: resultado.referencia,
        qrBase64: base64
      });
    }

    // Generar nuevo código QR
    const referencia = 'QR-' + generarCodigoComprobante();
    const fecha = new Date().toISOString();
    const datos = { idReserva, referencia, monto, fecha };

    const nombreBase = `qr_${Date.now()}`;
    const archivoJson = `${nombreBase}.json`;
    const archivoQRNuevo = `${nombreBase}.png`;

    const rutaJson = path.join(tempDir, archivoJson);
    const rutaQR = path.join(tempDir, archivoQRNuevo);

    // Guardar el archivo JSON
    fs.writeFileSync(rutaJson, JSON.stringify(datos, null, 2), 'utf-8');

    const contenidoQR = `idReserva: ${idReserva}, Monto: ${monto}, Referencia: ${referencia}, Fecha: ${fecha}`;

    // Generar el QR
    await QRCode.toFile(rutaQR, contenidoQR);

    // Convertir QR a base64
    const buffer = fs.readFileSync(rutaQR);
    const base64 = buffer.toString('base64');

    // Eliminar automáticamente después de 10 minutos
    setTimeout(() => {
      try {
        if (fs.existsSync(rutaQR)) fs.unlinkSync(rutaQR);
        if (fs.existsSync(rutaJson)) fs.unlinkSync(rutaJson);
        console.log(`Archivos eliminados automáticamente: ${rutaQR}, ${rutaJson}`);
      } catch (err) {
        console.error('Error al eliminar archivos temporales:', err);
      }
    }, 10 * 60 * 1000);

    return res.json({
      mensaje: 'QR generado correctamente',
      archivoQR: `${archivoQRNuevo}`,
      archivoJSON: `${archivoJson}`,
      referencia,
      qrBase64: base64
    });

  } catch (error: unknown) {
    console.error('Error al generar QR:', error);

    // Verificar si el error es una instancia de Error y acceder a las propiedades
    if (error instanceof Error) {
      return res.status(500).json({
        error: 'Error interno al generar el QR.',
        message: error.message,
        stack: error.stack // Para obtener más detalles sobre el error
      });
    } else {
      // En caso de que el error no sea una instancia de Error
      return res.status(500).json({
        error: 'Error desconocido al generar el QR.'
      });
    }
  }
};
