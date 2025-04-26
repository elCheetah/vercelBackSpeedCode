import { createCanvas } from 'canvas';
import path from 'path';
import fs from 'fs';

export const generarImagenPago = async (pago: any): Promise<{ nombreArchivo: string, base64: string }> => {
  const width = 500;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Colores y fondo
  const colorPrimario = '#ff7f00';
  const colorSecundario = '#0077ff';
  const gris = '#333333';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Header
  ctx.fillStyle = colorPrimario;
  ctx.fillRect(0, 0, width, 100);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('COMPROBANTE DE PAGO', 20, 60);

  // Línea separadora
  ctx.strokeStyle = colorSecundario;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 110);
  ctx.lineTo(width - 20, 110);
  ctx.stroke();

  // Detalles del pago
  ctx.fillStyle = gris;
  ctx.font = '20px Arial';
  const fecha = new Date().toLocaleString();
  const detalles = [
    `📆 Fecha: ${fecha}`,
    `💳 Método de pago: ${pago.metodo_pago}`,
    `💲 Monto: Bs. ${pago.monto}`,
    `🔗 Referencia: ${pago.referencia || 'N/A'}`,
    `📌 Concepto: ${pago.detalles?.concepto || 'Pago de reserva'}`,
    `✅ Estado: PAGADO`,
  ];

  let y = 150;
  for (const texto of detalles) {
    ctx.font = texto.startsWith('📆') ? 'bold 20px Arial' : 'normal 20px Arial';
    ctx.fillText(texto, 40, y);
    y += 40;
  }

  // Footer
  ctx.fillStyle = colorSecundario;
  ctx.font = '16px Arial';
  ctx.fillText('Gracias por su pago. Conserve este comprobante.', 40, height - 40);

  // Guardar en disco
  const tempDir = path.join(process.cwd(), 'public', 'cmp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const filename = `pago_${Date.now()}.png`;
  const imagePath = path.join(tempDir, filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(imagePath, buffer);

  // Programar eliminación
  setTimeout(() => {
    fs.unlink(imagePath, (err) => {
      if (err) console.error(`Error al eliminar comprobante: ${filename}`, err);
      else console.log(`Comprobante eliminado: ${filename}`);
    });
  }, 10 * 60 * 1000);

  // Codificar a base64
  const base64 = buffer.toString('base64');

  // Devolver nombre del archivo y base64
  return {
    nombreArchivo: filename,
    base64: base64
  };
};
