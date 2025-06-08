import { Router } from 'express';
import {
  filtrarVehiculos,
} from '../../controllers/speedcode/filtroMapaController';
import { autocompletarAeropuerto } from '../../controllers/speedcode/filtroAeropuertoController';
import { listarReservasAprobadas, getDetalleReserva } from "../../controllers/speedcode/reservasAprobadasController";
import { getTopAutos } from '../../controllers/speedcode/topAutosController';

import {
  obtenerUltimasBusquedas,
  registrarBusqueda,
  autocompletarBusquedas
} from "../../controllers/speedcode/historialBusquedaController";


const router = Router();

router.get('/filtroMapaPrecio', filtrarVehiculos);
router.get('/autocompletar/aeropuerto', autocompletarAeropuerto);
router.get("/reservas/aprobadas", listarReservasAprobadas);

//para mostrar detalle de reserva
router.get("/reservas/:id", getDetalleReserva);

//para el carrousel
router.get('/autos-top', getTopAutos);


//historial de busquedas
router.get("/ultimas", obtenerUltimasBusquedas);
router.post("/registrar", registrarBusqueda);
router.get("/autocompletar", autocompletarBusquedas);
export default router;