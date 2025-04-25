import fs from 'fs';
import path from 'path';

// Ruta pública donde se almacenan los archivos QR y JSON
const publicDir = path.join(process.cwd(), 'public', 'qr'); // Carpeta pública accesible

export function validarQR(nombreArchivoQR: string) {
  try {
    if (!fs.existsSync(publicDir)) {
      return {
        valido: false,
        errores: [`La carpeta pública no existe: ${publicDir}`]
      };
    }

    const nombreBase = path.parse(nombreArchivoQR).name;
    const rutaJson = path.join(publicDir, `${nombreBase}.json`);

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
    if (!fs.existsSync(publicDir)) {
      return {
        encontrado: false,
        errores: [`La carpeta pública no existe: ${publicDir}`]
      };
    }

    const archivos = fs.readdirSync(publicDir).filter(file => file.endsWith('.json'));

    for (let archivo of archivos) {
      const rutaJson = path.join(publicDir, archivo);

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
