import fs from 'fs';
import path from 'path';

export function validarQR(nombreArchivoQR: string) {
  const tempDir = path.join(__dirname, '..', 'temp');

  // Asegurarse de quitar la extensión si viene .png o .json
  const nombreBase = path.parse(nombreArchivoQR).name;
  const rutaJson = path.join(tempDir, `${nombreBase}.json`);

  if (!fs.existsSync(rutaJson)) {
    return {
      valido: false,
      errores: ['No se encontró codigo de Referencia QR válido.']
    };
  }

  try {
    const data = JSON.parse(fs.readFileSync(rutaJson, 'utf-8'));

    // Validar que tenga el comprobante dentro
    if (!data.referencia) {
      return {
        valido: false,
        errores: ['El archivo JSON no contiene un codigo de Referencia válido.']
      };
    }

    return {
      valido: true,
      referencia: data.referencia, // <- Aquí lo regresamos directamente
      datos: data // opcional, si quieres seguir usando monto y referencia también
    };
  } catch (err) {
    console.error('Error al leer el archivo JSON del QR:', err);
    return {
      valido: false,
      errores: ['Error al leer o parsear el archivo JSON.']
    };
  }
}


export function buscarQRPorReserva(idReserva: number) {
  const tempDir = path.join(__dirname, '..', 'temp');
  const archivos = fs.readdirSync(tempDir).filter(file => file.endsWith('.json'));

  for (let archivo of archivos) {
    const rutaJson = path.join(tempDir, archivo);

    try {
      const contenido = JSON.parse(fs.readFileSync(rutaJson, 'utf-8'));
      if (contenido.idReserva === String(idReserva)) {
        const archivoQR = archivo.replace('.json', '.png');
        return {
          encontrado: true,
          archivoQR: archivoQR,
          archivoJSON: archivo,
          referencia: contenido.referencia
        };
      }
    } catch (error) {
      console.error('Error al leer o parsear el archivo JSON:', error);
    }
  }
  return {
    encontrado: false
  };
}
