import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Función para limpiar la carpeta pública
export const limpiarCarpetaPublica = (req: Request, res: Response): Promise<any> => {
  return new Promise((resolve, reject) => {
    const rutaCarpetaPublica = path.join(process.cwd(), 'public');

    // Verificamos que la carpeta exista antes de continuar
    if (!fs.existsSync(rutaCarpetaPublica)) {
      return reject(res.status(404).json({ error: 'La carpeta pública no existe.' }));
    }

    // Lee el contenido de la carpeta pública
    fs.readdir(rutaCarpetaPublica, (errorLectura, archivos) => {
      if (errorLectura) {
        console.error('Error al leer la carpeta pública:', errorLectura);
        return reject(res.status(500).json({ error: 'No se pudo leer la carpeta pública.', detalle: errorLectura }));
      }

      let archivosEliminados = 0;
      let totalArchivos = archivos.length;

      if (totalArchivos === 0) {
        return resolve(res.send('No había contenido en la carpeta pública para eliminar.'));
      }

      archivos.forEach((archivo) => {
        const rutaCompleta = path.join(rutaCarpetaPublica, archivo);

        // Eliminamos el archivo o directorio de forma recursiva
        fs.rm(rutaCompleta, { recursive: true, force: true }, (errorEliminacion) => {
          if (errorEliminacion) {
            console.error(`No se pudo eliminar ${rutaCompleta}:`, errorEliminacion);
            return reject(res.status(500).json({
              error: `No se pudo eliminar el archivo: ${rutaCompleta}`,
              detalle: errorEliminacion,
            }));
          } else {
            console.log(`Eliminado: ${rutaCompleta}`);
          }

          archivosEliminados++;

          // Si se han eliminado todos los archivos, responde al cliente
          if (archivosEliminados === totalArchivos) {
            return resolve(res.send('Contenido de la carpeta pública eliminado correctamente.'));
          }
        });
      });
    });
  });
};
