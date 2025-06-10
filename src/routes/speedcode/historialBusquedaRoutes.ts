import { Router } from "express";
import {
  obtenerUltimasBusquedas,
  registrarBusqueda,
  autocompletarBusquedas,
  eliminarBusqueda,
  limpiarHistorial
} from "../../controllers/speedcode/historialBusquedaController";

const router = Router();

router.get("/ultimas", obtenerUltimasBusquedas);
router.post("/registrar", registrarBusqueda);
router.get("/autocompletar", autocompletarBusquedas);
router.delete("/eliminar", eliminarBusqueda);
router.delete("/limpiar", limpiarHistorial);

export default router;