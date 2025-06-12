import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public', 'qr');

// ✅ Valida si existe el archivo JSON y extrae referencia
export function validarQR(nombreArchivoQR: string) {
  try {
    if (!fs.existsSync(publicDir)) {
      return {
        valido: false,
        errores: [`❌ Carpeta QR no encontrada: ${publicDir}`],
      };
    }

    const nombreBase = path.parse(nombreArchivoQR).name;
    const rutaJson = path.join(publicDir, `${nombreBase}.json`);

    if (!fs.existsSync(rutaJson)) {
      return {
        valido: false,
        errores: [`❌ No se encontró el archivo JSON del QR: ${rutaJson}`],
      };
    }

    const raw = fs.readFileSync(rutaJson, 'utf-8');
    const data = JSON.parse(raw);

    if (!data.referencia) {
      return {
        valido: false,
        errores: [`❌ El JSON no contiene la propiedad "referencia".`],
      };
    }

    return {
      valido: true,
      referencia: data.referencia,
      datos: data,
    };
  } catch (error: any) {
    console.error("❌ Error en validarQR:", error);
    return {
      valido: false,
      errores: [`❌ Excepción: ${error.message}`],
    };
  }
}

// ✅ Busca si ya existe un QR generado para una reserva específica
export function buscarQRPorReserva(idReserva: number) {
  try {
    if (!fs.existsSync(publicDir)) {
      return {
        encontrado: false,
        errores: [`❌ Carpeta QR no encontrada: ${publicDir}`],
      };
    }

    const archivos = fs.readdirSync(publicDir).filter(f => f.endsWith('.json'));

    for (const archivo of archivos) {
      const ruta = path.join(publicDir, archivo);
      try {
        const json = JSON.parse(fs.readFileSync(ruta, 'utf-8'));
        if (json.idReserva === String(idReserva)) {
          const archivoQR = archivo.replace('.json', '.png');
          return {
            encontrado: true,
            archivoQR,
            archivoJSON: archivo,
            referencia: json.referencia
          };
        }
      } catch (err) {
        console.error(`⚠️ Error al leer JSON ${archivo}:`, err);
      }
    }

    return {
      encontrado: false,
      errores: [`⚠️ No se encontró QR vinculado a la reserva ${idReserva}`],
    };

  } catch (err: any) {
    console.error("❌ Error general en buscarQRPorReserva:", err);
    return {
      encontrado: false,
      errores: [`❌ Excepción: ${err.message}`],
    };
  }
}
