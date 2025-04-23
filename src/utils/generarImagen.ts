import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';

export const generarImagenPago = async (pago: any): Promise<string> => {
  const width = 800;
  const height = 1100;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Colores y fuentes
  const colorPrimario = '#ff7f00';
  const colorSecundario = '#0077ff';
  const gris = '#333333';

  // Fondo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Encabezado con fondo
  ctx.fillStyle = colorPrimario;
  ctx.fillRect(0, 0, width, 100);

  // Título
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('🧾 Comprobante de Pago', 20, 60);

  // Logo (opcional)
  try {
    const logoPath = path.join(__dirname, 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logo = await loadImage(logoPath);
      ctx.drawImage(logo, width - 130, 10, 100, 80);
    }
  } catch (e) {
    console.warn('Logo no disponible:', e);
  }

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
    ctx.fillText(texto, 40, y);
    y += 40;
  }

  // Pie
  ctx.fillStyle = '#666666';
  ctx.font = '16px Arial';
  ctx.fillText('Gracias por su pago. Conserve este comprobante.', 40, height - 40);

  // Guardar imagen
  const tempDir = path.join(__dirname, '..', 'comprobante');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const filename = `pago_${Date.now()}.png`;
  const imagePath = path.join(tempDir, filename);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(imagePath, buffer);

  // Eliminar después de 10 minutos
  setTimeout(() => {
    fs.unlink(imagePath, (err) => {
      if (err) console.error(`Error al eliminar comprobante: ${filename}`, err);
      else console.log(`Comprobante eliminado: ${filename}`);
    });
  }, 10 * 60 * 1000);

  return imagePath;
};
