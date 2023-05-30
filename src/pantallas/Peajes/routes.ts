import { Funcionalidades } from '@/config/funcionalidades';
import TarifasPeajes from './Tarifas/index.vue';
import Peajes from './Mantencion/index.vue';
import Reportes from './Reportes/index.vue';
import Asignacion from './Asignacion/index.vue';
import Dashboard from './Dashboard/index.vue';

const PeajesRoutes = [
  {
    path: 'Tarifa-Peajes',
    component: TarifasPeajes,
    meta: {
      description: 'Tarifas Peajes',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.TarifasPeajes,
    },
  },
  {
    path: 'Admin-Peajes',
    component: Peajes,
    meta: {
      description: 'Admin Peajes',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.TarifasPeajes,
    },
  },
  {
    path: 'Reportes-Peajes',
    component: Reportes,
    meta: {
      description: 'Reportes Peajes',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.ReportesPeajes,
    },
  },
  {
    path: 'Asignar-Vehiculos',
    component: Asignacion,
    meta: {
      description: 'AsignarVehiculos',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.AsignarVehiculosPeajes,
    },
  },
  {
    path: 'Dashboard-Peajes',
    component: Dashboard,
    meta: {
      description: 'Dashboard',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.DashboardPeajes,
    },
  },
];

export default PeajesRoutes;
