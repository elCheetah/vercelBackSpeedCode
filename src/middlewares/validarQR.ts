import fs from 'fs';
import path from 'path';

// Ruta absoluta y segura para temp
const tempDir =
  process.env.NODE_ENV === 'production'
    ? '/tmp' // Render o Vercel en producción
    : path.join(process.cwd(), 'temp'); // Local dev

export function validarQR(nombreArchivoQR: string) {
  try {
    if (!fs.existsSync(tempDir)) {
      return {
        valido: false,
        errores: [`La carpeta temporal no existe: ${tempDir}`]
      };
    }

    const nombreBase = path.parse(nombreArchivoQR).name;
    const rutaJson = path.join(tempDir, `${nombreBase}.json`);

    if (!fs.existsSync(rutaJson)) {
      return {
        valido: false,
        errores: [`No se encontró el archivo JSON del QR: ${rutaJson}`]
      };
    }

    const data = JSON.parse(fs.readFileSync(rutaJson, 'utf-8'));

    if (!data.referencia) {
      return {
        valido: false,
        errores: ['El archivo JSON no contiene un código de referencia válido.']
      };
    }

    return {
      valido: true,
      referencia: data.referencia,
      datos: data
    };
  } catch (err: any) {
    console.error('Error en validarQR:', err);
    return {
      valido: false,
      errores: [`Error al validar QR: ${err.message}`]
    };
  }
}

export function buscarQRPorReserva(idReserva: number) {
  try {
    if (!fs.existsSync(tempDir)) {
      return {
        encontrado: false,
        errores: [`La carpeta temporal no existe: ${tempDir}`]
      };
    }

    const archivos = fs.readdirSync(tempDir).filter(file => file.endsWith('.json'));

    for (let archivo of archivos) {
      const rutaJson = path.join(tempDir, archivo);

      try {
        const contenido = JSON.parse(fs.readFileSync(rutaJson, 'utf-8'));

        if (contenido.idReserva === String(idReserva)) {
          const archivoQR = archivo.replace('.json', '.png');
          return {
            encontrado: true,
            archivoQR,
            archivoJSON: archivo,
            referencia: contenido.referencia
          };
        }
      } catch (error: any) {
        console.error(`Error al leer el archivo ${archivo}:`, error);
        // Continúa con los siguientes archivos
      }
    }

    return {
      encontrado: false,
      errores: [`No se encontró un QR asociado a la reserva ${idReserva}`]
    };
  } catch (err: any) {
    console.error('Error en buscarQRPorReserva:', err);
    return {
      encontrado: false,
      errores: [`Error general al buscar el QR: ${err.message}`]
    };
  }
}
