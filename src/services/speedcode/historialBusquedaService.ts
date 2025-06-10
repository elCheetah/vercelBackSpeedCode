import fs from "fs";
import path from "path";

type Busqueda = {
  termino: string;
  creado_en: string; // guardamos como string para JSON
};

const LIMITE_HISTORIAL = 15;
const archivoHistorial = path.resolve(__dirname, "historial.json");

// Leer historial desde archivo
const leerHistorial = (): Record<number, Busqueda[]> => {
  if (!fs.existsSync(archivoHistorial)) return {};
  const data = fs.readFileSync(archivoHistorial, "utf-8");
  return JSON.parse(data);
};

// Guardar historial en archivo
const guardarHistorial = (data: Record<number, Busqueda[]>) => {
  fs.writeFileSync(archivoHistorial, JSON.stringify(data, null, 2));
};

export const obtenerUltimasBusquedas = (usuarioId: number, limite = 5): Busqueda[] => {
  const data = leerHistorial();
  const historial = data[usuarioId] || [];
  return historial
    .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime())
    .slice(0, limite);
};

export const registrarBusqueda = (usuarioId: number, termino: string): Busqueda => {
  const data = leerHistorial();
  const terminoNormalizado = termino.toLowerCase().trim();
  if (terminoNormalizado.length > 100) {
    throw new Error("El término de búsqueda no debe superar los 100 caracteres.");
  }

  const historial = data[usuarioId] || [];

  const index = historial.findIndex(b => b.termino === terminoNormalizado);
  if (index !== -1) {
    historial[index].creado_en = new Date().toISOString();
  } else {
    if (historial.length >= LIMITE_HISTORIAL) {
      historial.sort((a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime());
      historial.shift();
    }

    historial.push({
      termino: terminoNormalizado,
      creado_en: new Date().toISOString()
    });
  }

  data[usuarioId] = historial;
  guardarHistorial(data);

  return historial.find(b => b.termino === terminoNormalizado)!;
};

export const autocompletarBusquedas = (usuarioId: number, texto: string): Busqueda[] => {
  const data = leerHistorial();
  const historial = data[usuarioId] || [];
  const textoNormalizado = texto.toLowerCase().trim();

  return historial
    .filter(b => b.termino.includes(textoNormalizado))
    .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime())
    .slice(0, 5);
};