import { Request, Response, NextFunction } from 'express';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { generarCodigoComprobante } from './pago.controller';
import { buscarQRPorReserva } from './../middlewares/validarQR';

export const generarQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tipo, monto, idReserva } = req.params;

    // Validaciones básicas
    if (!monto || isNaN(Number(monto))) {
      return res.status(400).json({ error: 'Monto obligatorio y debe ser numérico.' });
    }

    if (!idReserva || isNaN(Number(idReserva))) {
      return res.status(400).json({ error: 'ID de reserva obligatorio y debe ser numérico.' });
    }

    if (!tipo || !['crear', 'regenerar'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo debe ser "crear" o "regenerar".' });
    }

    const reservaId = Number(idReserva);
    const publicDir = path.join(process.cwd(), 'public', 'qr');

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Verifica si ya hay QR para esta reserva
    const resultado = await buscarQRPorReserva(reservaId);

    if (tipo === 'regenerar' && resultado.encontrado) {
      // Eliminar QR anterior
      const rutaQRExistente = path.join(publicDir, resultado.archivoQR || '');
      const rutaJSONExistente = path.join(publicDir, resultado.archivoJSON || '');
      try {
        if (fs.existsSync(rutaQRExistente)) fs.unlinkSync(rutaQRExistente);
        if (fs.existsSync(rutaJSONExistente)) fs.unlinkSync(rutaJSONExistente);
        console.log('QR anterior eliminado correctamente.');
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

    // Generar nuevo QR
    const referencia = 'QR-' + generarCodigoComprobante();
    const fecha = new Date().toISOString();
    const datosJSON = {
      idReserva: reservaId.toString(),
      referencia,
      monto,
      fecha
    };

    const nombreBase = `qr_${Date.now()}`;
    const archivoJson = `${nombreBase}.json`;
    const archivoQRNuevo = `${nombreBase}.png`;

    const rutaJson = path.join(publicDir, archivoJson);
    const rutaQR = path.join(publicDir, archivoQRNuevo);

    // Guardar archivo JSON
    fs.writeFileSync(rutaJson, JSON.stringify(datosJSON, null, 2), 'utf-8');

    // Crear el contenido del QR
    const contenidoQR = `idReserva:${reservaId}; monto:${monto}; referencia:${referencia}; fecha:${fecha}`;
    await QRCode.toFile(rutaQR, contenidoQR);

    const buffer = fs.readFileSync(rutaQR);
    const base64 = buffer.toString('base64');

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
    return res.status(500).json({ error: 'Error interno al generar el QR.' });
  }
};
