import { Router } from "express";
import {
  obtenerUltimasBusquedas,
  registrarBusqueda,
  autocompletarBusquedas
} from "../../controllers/speedcode/historialBusquedaController";

const router = Router();

router.get("/ultimas", obtenerUltimasBusquedas);
router.post("/registrar", registrarBusqueda);
router.get("/autocompletar", autocompletarBusquedas);

export default router;
