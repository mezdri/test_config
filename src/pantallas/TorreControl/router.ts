import { Funcionalidades } from '@/config/funcionalidades';
import ControlFlotas from '@/pantallas/TorreControl/ControlFlotas/index.vue';
import ControlVehiculos from '@/pantallas/TorreControl/ControlVehiculos/index.vue';
import ControlDispositivos from '@/pantallas/TorreControl/ControlDispositivos/index.vue';
import ControlPatentes from '@/pantallas/TorreControl/ControlPatentes/index.vue';
import ReportesTorre from '@/pantallas/TorreControl/reportes/reportesTorre.vue';
import ControlInformes from '@/pantallas/TorreControl/ControlInformes/index.vue';
import Informes from '@/views/plataforma/Informes.vue';

const ControlTowerRoutes = [
  {
    path: '/Torre-Control/dashboard',
    component: ControlFlotas,
    meta: {
      description: 'Torre de Control',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.TorreControl,
    },
  },
  {
    path: '/Torre-Control/vehiculos/:id',
    component: ControlVehiculos,
    meta: {
      description: 'Vehiculos Flotas',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.TorreControl,
    },
  },
  {
    path: '/Torre-Control/dispositivos/:avl/:patente',
    component: ControlDispositivos,
    meta: {
      description: 'Dispositivos en Vehiculo',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.TorreControl,
    },
  },
  {
    path: '/Torre-Control/dispositivos',
    component: ControlDispositivos,
    meta: {
      description: 'Dispositivos',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.TorreControl,
    },
  },
  {
    path: '/Torre-Control/cuadraturas',
    component: ControlPatentes,
    meta: {
      description: 'Cuadraturas',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.TorreControl,
    },
  },
  {
    path: '/Torre-Control/reportes',
    component: ReportesTorre,
    meta: {
      description: 'Cuadraturas',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.TorreControl,
    },
  },
  {
    path: '/Torre-Control/informes_generados',
    component: ControlInformes,
    meta: {
      description: 'Informes',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.TorreControl,
    },
  },
  {
    path: '/Torre-Control/generar_informe',
    component: Informes,
    meta: {
      description: 'Informes',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.TorreControl,
    },
  },
];

export default ControlTowerRoutes;
