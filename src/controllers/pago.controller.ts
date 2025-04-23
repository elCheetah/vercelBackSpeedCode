// pago.controller.ts
import { Request, Response } from 'express';
import * as PagoService from '../services/pago.service';
import { sendEmail } from '../utils/mailer';
import { generarImagenPago } from '../utils/generarImagen';
import { MetodoPago } from '@prisma/client';
import { validarTarjeta } from '../middlewares/validarTarjeta'
import { validarQR } from '../middlewares/validarQR'

export const realizarPagoQR = async (req: Request, res: Response): Promise<any> => {
  try {
    const { reserva_idreserva } = req.params;
    const {
      nombreArchivoQR,
      monto,
      concepto,
      correoElectronico
    } = req.body;
    const metodo = "QR";
    // Validación de campos
    if (!nombreArchivoQR || !monto || !reserva_idreserva || !concepto || !correoElectronico) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    // Validación del QR
    const referenciaValidada = validarQR(nombreArchivoQR);
    if (!referenciaValidada.valido) {
      return res.status(400).json({ error: referenciaValidada.errores });
    }

    const codigoReferencia = referenciaValidada.referencia;
    const metodoPago: MetodoPago = MetodoPago.QR;

    // Conversión de datos
    const montoNum = parseFloat(monto);
    const idReservaNumerico = parseInt(reserva_idreserva, 10);

    if (isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({ error: 'El monto debe ser un número válido mayor que cero.' });
    }

    if (isNaN(idReservaNumerico)) {
      return res.status(400).json({ error: 'El ID de la reserva debe ser un número válido.' });
    }

    // Registro del pago
    const resultadoPago = await registrarPago(
      correoElectronico,
      idReservaNumerico,
      montoNum, // ← aquí pasamos el número
      metodoPago,
      codigoReferencia,
      concepto
    );

    if (resultadoPago.error) {
      return res.status(400).json({ error: resultadoPago.error });
    }

    // Respuesta exitosa
    return res.json({
      mensaje: 'Pago QR registrado correctamente.',
      pago: resultadoPago.pago,
      imagen: resultadoPago.imagen
    });

  } catch (error) {
    console.error('Error al registrar pago QR:', error);
    return res.status(500).json({ error: 'Error interno al procesar el pago.' });
  }
};


export const registrarPago = async (
  correo: string,
  reserva_idreserva: number,
  monto: number,
  metodo_pago: MetodoPago,
  referencia: string,
  concepto: string
): Promise<any> => {
  try {
    if (!correo) return { error: 'El correo es obligatorio' };
    if (!reserva_idreserva || isNaN(reserva_idreserva)) return { error: 'El ID de la reserva es obligatorio y debe ser un número' };
    if (monto <= 0) return { error: 'El monto debe ser mayor a cero' };
    if (!referencia) return { error: 'La referencia es obligatoria' };
    if (!concepto) return { error: 'El concepto del pago es obligatorio' };

    const nuevoPago = await PagoService.registrarPago(
      reserva_idreserva,
      monto,
      metodo_pago,
      referencia,
      concepto
    );
    const imagePath = await generarImagenPago(nuevoPago);

    const correoHtml = `
      <h2>Confirmación de Pago</h2>
      <p>Gracias por su pago. Aquí están los detalles:</p>
      <ul>
        <li>Método: ${metodo_pago}</li>
        <li>Monto: $${monto}</li>
        <li>Referencia: ${referencia}</li>
        <li>Concepto: ${concepto}</li>
      </ul>
    `;

    const exito = await sendEmail(
      correo,
      'Confirmación de Pago - RediBo',
      correoHtml,
      imagePath
    );

    if (!exito) throw new Error('Error al enviar el correo');

    return {
      message: 'Pago y detalle registrados correctamente',
      pago: nuevoPago,
      imagen: imagePath
    };

  } catch (error) {
    console.error('Error al registrar el pago:', error);
    return { error: 'Error interno al registrar el pago' };
  }
};

export const realizarPagoTarjeta = async (req: Request, res: Response): Promise<any> => {
  try {
    const { reserva_idreserva } = req.params;
    const {
      monto,
      concepto,
      nombreTitular,
      numeroTarjeta,
      fechaExpiracion,
      cvv,
      direccion,
      correoElectronico
    } = req.body;

const metodo = "TARJETA DÉBITO";
    const { valido, errores } = validarTarjeta(
      nombreTitular,
      numeroTarjeta,
      fechaExpiracion,
      cvv,
      direccion,
      correoElectronico,
    );

    if (!valido) {
      return res.status(400).json({ error: 'Errores en la validación de la tarjeta', detalles: errores });
    }

    const montoNum = parseFloat(monto);
    const reservaIdNum = parseInt(reserva_idreserva, 10);

    if (isNaN(montoNum) || isNaN(reservaIdNum)) {
      return res.status(400).json({ error: 'El monto o el ID de reserva no son válidos.' });
    }

    const metodoPago: MetodoPago = MetodoPago.TARJETA_DEBITO;
    const referencia = 'TC-' + generarCodigoComprobante();

    const resultado = await registrarPago(
      correoElectronico,
      reservaIdNum,
      montoNum,
      metodoPago,
      referencia,
      concepto
    );

    if (resultado.error) {
      return res.status(500).json({ error: resultado.error });
    }

    return res.status(200).json({
      mensaje: 'Pago con tarjeta registrado correctamente.',
      pago: resultado.pago,
      imagen: resultado.imagen
    });

  } catch (error) {
    console.error('Error al registrar pago con tarjeta:', error);
    return res.status(500).json({ error: 'Error interno al procesar el pago.' });
  }
};
export const obtenerPagos = async (_req: Request, res: Response) => {
  try {
    const pagos = await PagoService.obtenerPagos();
    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener los pagos:', error);
    res.status(500).json({ error: 'Error al obtener los pagos' });
  }
};

// Función para generar un código de comprobante aleatorio
export const generarCodigoComprobante = (): string => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let comprobante = '';
  for (let i = 0; i < 12; i++) {
    comprobante += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return comprobante;
};