import { Funcionalidades } from '@/config/funcionalidades';
import FlotaVehiculo from './FlotaVehiculo/index.vue';
import EditarVehiculoPantalla from './EditarVehiculos/EditarVehiculosPantalla.vue';
import ActivarIntegracion from './ActivarIntegracion/index.vue';
import ClasificacionPatentes from './ClasificacionPatentes/index.vue';
import ConfiguracionCamaras from './ClasificacionPatentes/IndexConfiguracionCamara.vue';
import MantenedorServipagPantalla from './MantenedorServipag/MantenedorServipagPantalla.vue';
import GrillaReportesConecta from './ReportesConecta/index.vue';
import MantenedorLocalidadPantalla from './MantenedorLocalidad/MantenedorLocalidadPantalla.vue';
import MotivodeBajaPantalla from './MotivodeBaja/MotivodeBajaPantalla.vue';
import MantenedorCoordinadorPantalla from './MantenedorCoordinador/MantenedorCoordinadorPantalla.vue';
import ConfigAutorizacionesPantalla from './ConfigAutorizaciones/ConfigAutorizacionesPantalla.vue';

const ConectaRoutes = [
  {
    path: 'Flota-Vehiculo',
    component: FlotaVehiculo,
    meta: {
      description: 'Flota Vehículo',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.FlotaVehiculo,
    },
  },
  {
    path: 'MantenedorServipag',
    component: MantenedorServipagPantalla,
    meta: {
      description: 'MantenedorServipag',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.MantenedorServipag,
    },
  },
  {
    path: 'MotivodeBaja',
    component: MotivodeBajaPantalla,
    meta: {
      description: 'Motivo de Baja',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.MotivodeBaja,
    },
  },
  {
    path: 'editar-vehiculos',
    component: EditarVehiculoPantalla,
    meta: {
      description: 'Editar Vehículo',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.EditarVehiculos,
    },
  },
  {
    path: 'Activar-Integracion',
    component: ActivarIntegracion,
    meta: {
      description: 'Activar Integración',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.IntegracionVehiculo,
    },
  },
  {
    path: 'Clasificacion-Patentes-Camaras',
    component: ClasificacionPatentes,
    meta: {
      description: 'Clasificación Patentes Camaras',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.ClasificacionPatentes,
    },
  },
  {
    path: 'configuracion-camaras',
    component: ConfiguracionCamaras,
    meta: {
      description: 'Configuración Cámaras',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.ConfiguracionCamaras,
    },
  },
  {
    path: 'conecta-reportes',
    component: GrillaReportesConecta,
    meta: {
      description: 'Reportes',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.GrillaReportesConecta,
    },
  },
  {
    path: 'mantenedor-de-localidad',
    component: MantenedorLocalidadPantalla,
    meta: {
      description: 'Mantenedor de Localidad',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.localidad,
    },
  },
  {
    path: 'mantenedor-de-coordinadores',
    component: MantenedorCoordinadorPantalla,
    meta: {
      description: 'Mantenedor de Coordinadores',
      requireAuth: true,
      moduloCodigo: Funcionalidades.coordinador,
    },
  },
  {
    path: 'Configuracion-Autorizaciones',
    component: ConfigAutorizacionesPantalla,
    meta: {
      description: 'Vista Configuración de Autorizaciones',
      requiresAuth: true,
      moduloCodigo: Funcionalidades.ConfigAutorizaciones,
    },
  },
];

export default ConectaRoutes;
