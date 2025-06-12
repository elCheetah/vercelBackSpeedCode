import { Request, Response, NextFunction } from 'express';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { generarCodigoComprobante } from './pago.controller';
import { buscarQRPorReserva } from './../middlewares/validarQR';

export const generarQR = async (req: Request, res: Response, next: NextFunction) => {
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
    const publicDir = path.join(process.cwd(), 'public', 'qr');

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const resultado = await buscarQRPorReserva(reservaId);

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

    const referencia = 'QR-' + generarCodigoComprobante();
    const fecha = new Date().toISOString();
    const datos = { idReserva, referencia, monto, fecha };

    const nombreBase = `qr_${Date.now()}`;
    const archivoJson = `${nombreBase}.json`;
    const archivoQRNuevo = `${nombreBase}.png`;

    const rutaJson = path.join(publicDir, archivoJson);
    const rutaQR = path.join(publicDir, archivoQRNuevo);

    fs.writeFileSync(rutaJson, JSON.stringify(datos, null, 2), 'utf-8');

    const contenidoQR = `idReserva: ${idReserva}, Monto: ${monto}, Referencia: ${referencia}, Fecha: ${fecha}`;
    await QRCode.toFile(rutaQR, contenidoQR);

    const buffer = fs.readFileSync(rutaQR);
    const base64 = buffer.toString('base64');

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
      urlQR: `https://vercelbackspeedcode.onrender.com/qr/${archivoQRNuevo}`
    });

  } catch (error) {
    console.error('Error al generar QR:', error);
    next(error); // ✅ Llama a next para pasar errores a Express
  }
};
