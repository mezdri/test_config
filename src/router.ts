import Vue from 'vue';
import Router, { RouteConfig as RouteConfigBase } from 'vue-router';
import { isEmpty } from 'lodash';

import Home from './views/Home.vue';
import NotFound from './views/NotFound.vue';
import Usuarios from './views/administracion/Usuarios.vue';
import UsuariosTransversal from './views/administracion/UsuariosTransversal.vue';
import Roles from './views/administracion/Roles.vue';
import AsignacionTransportista from './views/administracion/AsignacionTransportista.vue';
import Perfiles from './views/administracion/Perfiles.vue';
import Modulos from './views/administracion/Modulos.vue';
import Acciones from './views/administracion/Acciones.vue';
import Login from './views/auth/Login.vue';
import ReestrablecerPass from './views/auth/ReestrablecerPass.vue';
import Registro from './views/auth/Registro.vue';
import MiPerfil from './views/auth/MiPerfil.vue';
import Vehiculos from './views/plataforma/Vehiculos.vue';
import Conductores from './views/plataforma/Conductores.vue';
import Grupodeconductores from './views/plataforma/GrupoConductores.vue';
import TipoVehiculo from './views/plataforma/TipoVehiculo.vue';
import CortaCorrientePantalla from './pantallas/CortaCorriente/CortaCorrientePantalla.vue';
import Flotas from './views/plataforma/Flotas.vue';
import FlotasCompartidas from './views/plataforma/FlotasCompartidas.vue';
import GPSs from './views/plataforma/GPS.vue';
import SIM from './views/plataforma/SIM.vue';
import Etiqueta from './views/plataforma/Etiquetas.vue';
import config from '@/config/index';
import Cliente from './views/plataforma/Cliente.vue';
import ParametrosSistema from './views/administracion/ParametrosSistema.vue';
import ParametrosSistemaCliente from './views/administracion/ParametrosSistemaCliente.vue';
import Auditoria from './views/administracion/Auditoria.vue';
import { eventBusSidebarClick } from '@/setup';
import Zonas from './views/plataforma/Zonas.vue';
import TipoLugar from './views/plataforma/GrupoDeZona.vue';
import TipoLugarInteres from './views/plataforma/GrupoDeInteres.vue';
import LugarInteres from './views/plataforma/LugarInteres.vue';
import CompartirInformacion from './views/plataforma/CompartirInformacion.vue';
import AceptarInformacion from './views/plataforma/AceptarInformacion.vue';
import RolesTransversal from './views/administracion/RolesTransversal.vue';
import PerfilesTransversal from './views/administracion/PerfilesTransversal.vue';
import AlertasPantalla from '@/pantallas/Alertas/AlertasPantalla.vue';
import AlertaBasePantalla from '@/pantallas/ConfigurarBase/AlertaBasePantalla.vue';
import CamaraHistoricoPantalla from '@/pantallas/Camaras/Historico/CamaraHistoricoPantalla.vue';
import CamaraEnVivoPantalla from '@/pantallas/Camaras/EnVivo/CamaraEnVivoPantalla.vue';
import CamaraRegistroPantalla from '@/pantallas/Camaras/Registro/CamaraRegistroPantalla.vue';
import CamaraDashboardPantalla from '@/pantallas/Camaras/Dashboard/CamaraDashboardPantalla.vue';
import CamaraDashboardPantallaVigilanti from '@/pantallas/Camaras/Dashboard/CamaraDashboardPantalla.vue';
import CamaraVODPantalla from '@/pantallas/Camaras/VOD/CamaraVODPantalla.vue';
import CamaraAlertaPantalla from '@/pantallas/Camaras/Alerta/CamaraAlertaPantalla.vue';
import Informes from './views/plataforma/Informes.vue';
import InicioPantalla from '@/pantallas/Inicio/InicioPantalla.vue';
import Importar from '@/views/plataforma/Importar.vue';
import ConversorPantalla from '@/pantallas/Importar/Conversor/ConversorPantalla.vue';
import ContactosPantalla from '@/pantallas/Contactos/ContactosPantalla.vue';
import DashboardEsmax from '@/pantallas/DashboardEsmax/DashboardEsmax.vue';
import DashboardPantalla from '@/pantallas/Dashboard/DashboardPantalla.vue';
import RecepcionesActividadPantalla from '@/pantallas/Recepcion/RecepcionesActividadPantalla.vue';
import PautasActividadesPantalla from '@/pantallas/PautasActividades/PautasActividadesPantalla.vue';
import Actividades from '@/views/administracion/Actividades.vue';
import TalleresPantalla from '@/pantallas/Taller/TalleresPantalla.vue';
import TipoContactoPantalla from '@/pantallas/TipoContacto/TipoContactoPantalla.vue';
import ListaDistribucionPantalla from '@/pantallas/ListaDistribucion/ListaDistribucionPantalla.vue';
import RecalibrarOdometroPantalla from '@/pantallas/CalibracionVehiculo/RecalibrarOdometroPantalla.vue';
import RecalibrarHorometroPantalla from '@/pantallas/CalibracionVehiculo/RecalibrarHorometroPantalla.vue';
import PlanesMantenimientoPantalla from '@/pantallas/PlanesMantenimiento/PlanesMantenimientoPantalla.vue';
import CalendariosPantalla from '@/pantallas/Calendarios/CalendariosPantalla.vue';
import InformesGeneradosPantalla from '@/pantallas/Informes/InformesGenerados/InformesGeneradosPantalla.vue';
import TipoLicencia from './views/plataforma/TipoLicencia.vue';
import ProveedorPantalla from '@/pantallas/Proveedor/ProveedorPantalla.vue';
import ClienteProveedorPantalla from '@/pantallas/ClienteProveedor/ClienteProveedorPantalla.vue';
import TipoMantenimientoPantalla from '@/pantallas/TipoMantenimiento/TipoMantenimientoPantalla.vue';
import FacturacionPantalla from '@/pantallas/Facturacion/FacturacionPantalla.vue';
import SolicitudesPantalla from '@/pantallas/Solicitudes/SolicitudesPantalla.vue';
import CertificadosBase from '@/pantallas/CertificadosBase/CertificadosBasePantalla.vue';
import ConsultarFolio from '@/pantallas/ConsultarFolio/ConsultarFolioPantalla.vue';
import TipoDispositivoPantalla from '@/pantallas/TipoDispositivo/TipoDispositivoPantalla.vue';
import TipoMedidaPantalla from '@/pantallas/TipoMedida/TipoMedidaPantalla.vue';
import PreventivasPantalla from '@/pantallas/Preventivas/PreventivasPantalla.vue';
import DispositivosPantalla from '@/pantallas/Dispositivos/DispositivosPantalla.vue';
import BuscaVehiculo from '@/views/plataforma/BuscaVehiculo.vue';
import CorrectivasPantalla from '@/pantallas/Correctivas/CorrectivasPantalla.vue';
import HistoricoMantenimientoPantalla from '@/pantallas/HistoricoMantenimiento/HistoricoMantenimientosPantalla.vue';
import DescargasActividadPantalla from '@/pantallas/DescargaActividades/DescargasActividadPantalla.vue';
import ContratoProveedorPantalla from '@/pantallas/ContratoProveedor/ContratoProveedorPantalla.vue';
import EnvioInformacionPantalla from '@/pantallas/EnvioInformacion/EnvioInformacionPantalla.vue';
import FuncionesGlobalesPantalla from '@/pantallas/FuncionesGlobales/FuncionesGlobalesPantalla.vue';
import Notificaciones from './views/plataforma/Notificaciones.vue';
import ProgramacionInforme from '@/pantallas/ProgramacionInforme/ProgramacionInformePantalla.vue';
import HistoricoInforme from '@/pantallas/HistoricoInforme/HistoricoInforme.vue';
import Mensajes from '@/pantallas/CopilotoVirtual/Mensaje/MensajesPantalla.vue';
import ConductoresCopiloto from '@/pantallas/CopilotoVirtual/Conductores/ConductoresPantalla.vue';
import Eventos from '@/pantallas/CopilotoVirtual/Eventos/EventoPantalla.vue';
import Rutas from '@/pantallas/CopilotoVirtual/Ruta/RutasPantalla.vue';
import HomeSugal from '@/pantallas/Sugal/HomeSugal.vue';
import CargasSugal from '@/pantallas/Sugal/CargasSugal.vue';
import Cosechadoras from '@/pantallas/Sugal/Cosechadoras.vue';
import AppExterna from '@/pantallas/MultiApp/AppExterna.vue';
import DatosSertec from '@/pantallas/DatosSertec/DatosSertec.vue';
import RepetirDia from '@/pantallas/RepetirDia/Repetirdia.vue';
import AlertasVigilanti from '@/pantallas/Camaras/Alertas/AlertasVigilantiPantalla.vue';
import ConfigurarAlertas from '@/pantallas/Camaras/ConfigurarAlertas/ConfigurarAlertasPantalla.vue';
import Ramplas from '@/pantallas/Ramplas/Ramplas.vue';
import VerFacturacion from '@/pantallas/SucursalVirtual/VerFacturacion/VerFacturacionPantalla.vue';
import NuevaSolicitud from '@/pantallas/SucursalVirtual/NuevaSolicitud/NuevaSolicitudPantalla.vue';
import MisDocumentos from '@/pantallas/SucursalVirtual/MisDocumentos/MisDocumentosPantalla.vue';
import MisSolicitudes from '@/pantallas/SucursalVirtual/MisSolicitudes/MisSolicitudesPantalla.vue';
import CertificadosSucursal from '@/pantallas/SucursalVirtual/Certificados/CertificadosSucursalPantalla.vue';
import MisVisitas from '@/pantallas/SucursalVirtual/MisVisitas/MisVisitasPantalla.vue';
import InformesGeneradosSV from '@/pantallas/SucursalVirtual/Certificados/InformesGenerados.vue';
import CapacitacionesPantalla from '@/pantallas/SucursalVirtual/Capacitaciones/CapacitacionesPantalla.vue';
import ClientesConecta from '@/pantallas/Conecta/Clientes/ClientesConectaPantalla.vue';
import ConectaRoutes from '@/pantallas/Conecta/routes';
import ControlTowerRoutes from '@/pantallas/TorreControl/router';
import PeajesRoutes from '@/pantallas/Peajes/routes';
import ComponentsRoutes from './pantallas/ComponentUsage/routes';
import HomeGenerico from '@/components/MultiApp/HomeGenerico.vue';
import ConfigurarLanding from './views/plataforma/ConfigurarLanding.vue';
import ConfiguracionComandosSMSPantalla from '@/pantallas/TorreControl/ConfiguracionComandosSMS/ConfiguracionComandosSMSPantalla.vue';
import EnvioComandosSMSPantalla from '@/pantallas/TorreControl/EnvioComandosSMS/EnvioComandosSMSPantalla.vue';
import ReportesSMSPantalla from '@/pantallas/TorreControl/ReportesSMS/ReportesSMSPantalla.vue';
import MantenedorProveedores from '@/pantallas/Proveedores/MantenedorProveedores.vue';
import MovimientoDispositivos from '@/pantallas/MovimientoDispositivos/MovimientoDispositivos.vue';
import RecepcionEquipos from '@/pantallas/RecepcionEquipos/RecepcionEquipos.vue';
import MedioAmbienteRouter from '@/pantallas/MedioAmbiente/router';

import { actionsEvent } from '@/setup';

import ComandoVelocidadPantalla from '@/pantallas/ComandoVelocidad/ComandoVelocidadPantalla.vue';

// import CertificadoEmisionPantalla from '@/pantallas/CertificadosEmision/CertificadoEmisionPantalla.vue';
import CertificadoEmisionPantalla from './views/plataforma/EmitirCertificado.vue';

import { AccionesUsuario, CodigoAccion } from '@/views/base/VariablesPermisos';
import { Funcionalidades } from '@/config/funcionalidades';
import Despacho from '@/pantallas/Despacho/Despacho.vue';
import store from '@/store';

import ReportesSeriePantalla from '@/pantallas/ReportesSerie/ReportesSeriePantalla.vue';
import ReportesSerieActivaPantalla from '@/pantallas/ReportesSerieActiva/ReportesSerieActivaPantalla.vue';
import ReportesInventarioSim from '@/pantallas/InventarioSim/InventarioSimPantalla.vue';
import SimBajaIndividualPantalla from '@/pantallas/SimBajaIndividual/SimBajaIndividualPantalla.vue';
import EquiposEnTerrenoPantalla from '@/pantallas/EquiposEnTerreno/EquiposEnTerrenoPantalla.vue';

Vue.use(Router);

interface RouteConfig extends RouteConfigBase {
  children?: RouteConfig[];
  meta: {
    description?: string;
    requiresAuth?: boolean;
    moduloCodigo: Funcionalidades | null;
  };
}

const router: Router = new Router({
  base: config.getBaseUrl(),
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
  mode: 'history',
  routes: [
    {
      path: '/login',
      component: Login,
      meta: { moduloCodigo: null },
    },
    {
      path: '/reestablecerpass/:id/:fecha',
      component: ReestrablecerPass,
      meta: { moduloCodigo: null },
    },
    {
      path: '/',
      component: Home,
      meta: {
        description: 'Home',
        requiresAuth: true,
        moduloCodigo: null,
      },
      children: [
        {
          path: 'inicio',
          alias: '',
          name: 'inicio',
          component: InicioPantalla,
          meta: { requiresAuth: true, moduloCodigo: null },
        },
        {
          path: 'emitir-certificado',
          component: CertificadoEmisionPantalla,
          name: 'CertificadoEmisionNuevo',
          meta: {
            description: 'CertificadoEmision',
            requiresAuth: false,
            moduloCodigo: Funcionalidades.EmitirCertificado,
          },
        },
        {
          path: 'comandoVelocidad',
          component: ComandoVelocidadPantalla,
          name: 'ComandoVelocidad',
          meta: {
            description: 'ComandoVelocidad',
            requiresAuth: true,
            moduloCodigo: null,
          },
        },
        {
          path: 'usuarios',
          component: Usuarios,
          name: 'Usuarios',
          meta: {
            description: 'Usuarios',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Usuarios,
          },
        },
        {
          path: 'usuariosTransversal',
          component: UsuariosTransversal,
          name: 'Usuarios Transversales',
          meta: {
            description: 'UsuariosTransversal',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.UsuariosTransversal,
          },
        },
        {
          path: 'rolesTransversal',
          component: RolesTransversal,
          name: 'Roles Transversal',
          meta: {
            description: 'RolesTransversal',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.RolesTransversal,
          },
        },
        {
          path: 'perfilesTransversal',
          component: PerfilesTransversal,
          name: 'Perfiles Transversal',
          meta: {
            description: 'PerfilesTransversal',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.PerfilTransversal,
          },
        },
        {
          path: 'actividades',
          component: Actividades,
          name: 'Actividades',
          meta: {
            description: 'Actividades',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Actividades,
          },
        },
        {
          path: 'talleres',
          component: TalleresPantalla,
          name: 'Talleres',
          meta: {
            description: 'Talleres',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Talleres,
          },
        },
        {
          path: 'roles',
          component: Roles,
          name: 'Roles',
          meta: {
            description: 'Roles',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Roles,
          },
        },
        {
          path: 'asignacionTransportista',
          component: AsignacionTransportista,
          name: 'AsignacionTransportista',
          meta: {
            description: 'AsignacionTransportista',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.AsignacionTransportista,
          },
        },
        {
          path: 'perfiles',
          component: Perfiles,
          name: 'perfiles',
          meta: {
            description: 'Perfiles',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Perfiles,
          },
        },
        {
          path: 'modulos',
          component: Modulos,
          name: 'modulos',
          meta: {
            description: 'modulos',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Funcionalidades,
          },
        },
        {
          path: 'acciones',
          component: Acciones,
          name: 'acciones',
          meta: {
            description: 'Acciones',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Acciones,
          },
        },
        {
          path: 'parametrosSistema',
          component: ParametrosSistema,
          name: 'parametrosSistema',
          meta: {
            description: 'Parametros del sistema',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ParametrosSistema,
          },
        },
        {
          path: 'parametrosSistemaCliente',
          component: ParametrosSistemaCliente,
          name: 'parametrosSistemaCliente',
          meta: {
            description: 'Parametros del sistema',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ParametrosSistemaCliente,
          },
        },
        {
          path: 'auditoria',
          component: Auditoria,
          name: 'auditoria',
          meta: {
            description: 'Auditoria',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Auditoria,
          },
        },
        {
          path: 'vehiculos',
          component: Vehiculos,
          name: 'vehiculos',
          meta: {
            description: 'Vehiculos',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Vehiculos,
          },
        },
        {
          path: 'conductores',
          component: Conductores,
          name: 'conductores',
          meta: {
            description: 'Conductores',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Conductores,
          },
        },
        {
          path: 'grupoconductores',
          component: Grupodeconductores,
          name: 'grupoconductores',
          meta: {
            description: 'Grupo de Conductores',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.GrupoDeConductores,
          },
        },
        {
          path: 'clientes',
          component: Cliente,
          name: 'cliente',
          meta: {
            description: 'Clientes',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Clientes,
          },
        },
        {
          path: 'flotas',
          component: Flotas,
          name: 'flotas',
          meta: {
            description: 'Flotas',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Flotas,
          },
        },
        {
          path: 'corta-corriente',
          component: CortaCorrientePantalla,
          name: 'Corta Corriente',
          meta: {
            description: 'Corta Corriente',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.CortaCorriente,
          },
        },
        {
          path: 'flotascompartidas',
          component: FlotasCompartidas,
          name: 'flotascompartidas',
          meta: {
            description: 'Flotas Compartidas',
            requiresAuth: true,
            moduloCodigo: null,
          },
        },
        {
          path: 'Zonas',
          component: Zonas,
          name: 'zonas',
          meta: {
            description: 'Zonas',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Zonas,
          },
        },
        {
          path: 'Alertas',
          component: AlertasPantalla,
          name: 'alertas',
          meta: {
            description: 'Alertas',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Alertas,
          },
        },
        {
          path: 'configurar-base',
          component: AlertaBasePantalla,
          name: 'alertasBase',
          meta: {
            description: 'Configurar Base',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.AlertasBase,
          },
        },
        {
          path: 'Importar',
          component: Importar,
          name: 'importar',
          meta: {
            description: 'Importar',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Importar,
          },
        },
        {
          path: 'conversor',
          component: ConversorPantalla,
          name: 'conversor',
          meta: {
            description: 'Conversor',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.conversor,
          },
        },
        {
          path: 'lugarinteres',
          component: LugarInteres,
          name: 'lugarinteres',
          meta: {
            description: 'Lugares de Interés',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.LugarInteres,
          },
        },
        {
          path: 'grupodezona',
          component: TipoLugar,
          name: 'grupodezona',
          meta: {
            description: 'Grupos de Zonas',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.GrupoDeZona,
          },
        },
        {
          path: 'gps',
          component: GPSs,
          name: 'gps',
          meta: {
            description: 'GPS',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.GPS,
          },
        },
        {
          path: 'sim',
          component: SIM,
          name: 'sim',
          meta: {
            description: 'SIM',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.SIM,
          },
        },
        {
          path: 'etiqueta',
          component: Etiqueta,
          name: 'etiqueta',
          meta: {
            description: 'Etiqueta',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.EtiquetaVehiculos,
          },
        },
        {
          path: 'miperfil',
          component: MiPerfil,
          name: 'miperfil',
          meta: {
            description: 'miperfil',
            requiresAuth: true,
            moduloCodigo: null,
          },
        },
        {
          path: 'grupodeinteres',
          component: TipoLugarInteres,
          name: 'grupodeinteres',
          meta: {
            description: 'Grupos de Interes',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.GrupoDeInteres,
          },
        },
        {
          path: 'compartirinformacion',
          component: CompartirInformacion,
          name: 'compartirinformacion',
          meta: {
            description: 'Compartir Información',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.CompartirInformacion,
          },
        },
        {
          path: 'tipodelicencia',
          component: TipoLicencia,
          name: 'tipodelicencia',
          meta: {
            description: 'Tipo de Licencia',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.TipoLicencia,
          },
        },
        {
          path: 'aceptarinformacion',
          component: AceptarInformacion,
          name: 'aceptarinformacion',
          meta: {
            description: 'Aceptar Información',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.AceptarInformacion,
          },
        },
        {
          path: 'camaras-historico',
          component: CamaraHistoricoPantalla,
          name: 'cámaras-historico',
          meta: {
            description: 'Camara - Histórico',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.CamarasHistorico,
          },
        },
        {
          path: 'camaras-dashboard',
          component: CamaraDashboardPantalla,
          name: 'cámaras-dashboard',
          meta: {
            description: 'Camara - Dashboard',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.CamarasDashboard,
          },
        },
        {
          path: 'dashboard-vigilanti',
          component: CamaraDashboardPantallaVigilanti,
          name: 'dashboard-vigilanti',
          meta: {
            description: 'Vigilanti - Dashboard',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.DashboardVigilanti,
          },
        },
        {
          path: 'camaras-registro',
          component: CamaraRegistroPantalla,
          name: 'cámaras-registro',
          meta: {
            description: 'Camara - Registro',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.CamarasRegistro,
          },
        },
        {
          path: 'camaras-envivo',
          component: CamaraEnVivoPantalla,
          name: 'cámaras-envivo',
          meta: {
            description: 'Camara - En vivo',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.CamarasEnVivo,
          },
        },
        {
          path: 'camaras-operaciones',
          component: CamaraEnVivoPantalla,
          name: 'cámaras-operaciones',
          meta: {
            description: 'Camara - Operaciones',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.CamarasOperaciones,
          },
        },
        {
          path: 'camaras-vod',
          component: CamaraVODPantalla,
          name: 'camaras-vod',
          meta: {
            description: 'Cámara - VOD',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.CamarasVOD,
          },
        },
        {
          path: 'camaras-alerta',
          component: CamaraAlertaPantalla,
          name: 'camaras-alerta',
          meta: {
            description: 'Cámara - Alerta',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.CamarasAlerta,
          },
        },
        {
          path: 'informes',
          component: Informes,
          name: 'informes',
          meta: {
            description: 'Informes',
            requiresAuth: true,
            moduloCodigo: null,
          },
        },
        {
          path: 'programacion-informe',
          component: ProgramacionInforme,
          name: 'programacion',
          meta: {
            description: 'Programación Informe',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ProgramacionInforme,
          },
        },
        {
          path: 'programacion-informe-torre-control',
          component: ProgramacionInforme,
          name: 'programacion',
          meta: {
            description: 'Programación Informe',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ProgramacionInforme,
          },
        },
        {
          path: 'informe-generado',
          component: InformesGeneradosPantalla,
          name: 'informes-generados',
          meta: {
            description: 'Informes Generados',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.InformesGenerados,
          },
        },
        {
          path: 'historico-informes',
          component: HistoricoInforme,
          name: 'historico',
          meta: {
            description: 'Histórico Informes',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ProgramacionInforme,
          },
        },
        {
          path: 'informe-generado-vigilanti',
          component: InformesGeneradosPantalla,
          name: 'informes-generados-vigilanti',
          meta: {
            description: 'Informes Generados',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.InformesGenerados,
          },
        },
        {
          path: 'informe-generado-camaras',
          component: InformesGeneradosPantalla,
          name: 'informes-generados-camaras',
          meta: {
            description: 'Informes Generados',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.InformesGenerados,
          },
        },
        {
          path: 'tipodevehiculo',
          component: TipoVehiculo,
          name: 'tipodevehiculo',
          meta: {
            description: 'Tipo De Vehículo',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.TipoDeVehiculo,
          },
        },
        {
          path: 'contactos',
          component: ContactosPantalla,
          meta: {
            description: 'Contactos',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Contactos,
          },
        },
        {
          path: 'dashboard',
          component: DashboardPantalla,
          meta: {
            description: 'Dashboard',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Dashboard,
          },
        },
        {
          path: 'dashboardEsmax',
          component: DashboardEsmax,
          meta: {
            description: 'Dashboard',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.DashboardEsmax,
          },
        },
        {
          path: 'formulrioSertec',
          component: DatosSertec,
          meta: {
            description: 'formulrioSertec',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.FormularioSertec,
          },
        },
        {
          path: 'pautas-de-actividades',
          component: PautasActividadesPantalla,
          name: 'pautaActividades',
          meta: {
            description: 'Pautas De Actividades',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.PautasActividades,
          },
        },
        {
          path: 'recepcion-de-actividades',
          component: RecepcionesActividadPantalla,
          meta: {
            description: 'Recepción De Actividades',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.RecepcionDeActividades,
          },
        },
        {
          path: 'servicio-de-descarga',
          component: DescargasActividadPantalla,
          meta: {
            description: 'Descarga De Información',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Descargas,
          },
        },
        {
          path: 'tipo-de-contacto',
          component: TipoContactoPantalla,
          meta: {
            description: 'Tipo De Contacto',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.TipoDeContacto,
          },
        },
        {
          path: 'lista-de-distribucion',
          component: ListaDistribucionPantalla,
          meta: {
            description: 'Lista de Distribución',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ListaDeDistribucion,
          },
        },
        {
          path: 'recalibrar-odometro',
          component: RecalibrarOdometroPantalla,
          meta: {
            description: 'Odometro',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Odometro,
          },
        },
        {
          path: 'recalibrar-horometro',
          component: RecalibrarHorometroPantalla,
          meta: {
            description: 'Horometro',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Horometro,
          },
        },
        {
          path: 'planes-de-mantenimiento',
          component: PlanesMantenimientoPantalla,
          meta: {
            description: 'Plan de Mantenimiento',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.PlanDeMantenimiento,
          },
        },
        {
          path: 'calendarios',
          component: CalendariosPantalla,
          meta: {
            description: 'Calendarios',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Calendarios,
          },
        },
        {
          path: 'proveedor',
          component: ProveedorPantalla,
          meta: {
            description: 'Proveedor',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Proveedor,
          },
        },
        {
          path: 'cliente-proveedor',
          component: ClienteProveedorPantalla,
          meta: {
            description: 'Proveedor',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ClienteProveedor,
          },
        },
        {
          path: 'tipo-mantenimiento',
          component: TipoMantenimientoPantalla,
          meta: {
            description: 'TipoMantenimiento',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.TipoMantenimiento,
          },
        },
        {
          path: 'facturacion',
          component: FacturacionPantalla,
          meta: {
            description: 'Facturación',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Facturacion,
          },
        },
        {
          path: 'solicitudes',
          component: SolicitudesPantalla,
          meta: {
            description: 'Solicitudes',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Solicitudes,
          },
        },
        {
          path: 'certificados-base',
          component: CertificadosBase,
          meta: {
            description: 'Certificados Base',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.CertificadosBase,
          },
        },
        {
          path: 'consultar-folio',
          component: ConsultarFolio,
          meta: {
            description: 'Consultar Folio',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ConsultarFolio,
          },
        },
        {
          path: 'tipo-de-dispositivo',
          component: TipoDispositivoPantalla,
          meta: {
            description: 'Tipo De Dispositivo',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.TipoDeDispositivo,
          },
        },
        {
          path: 'tipo-de-medida',
          component: TipoMedidaPantalla,
          meta: {
            description: 'Tipo De Medida',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.TipoDeMedida,
          },
        },
        {
          path: 'preventivas',
          component: PreventivasPantalla,
          meta: {
            description: 'Preventivas',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Preventivas,
          },
        },
        {
          path: 'correctivas',
          component: CorrectivasPantalla,
          meta: {
            description: 'Correctivas',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Correctivas,
          },
        },
        {
          path: 'dispositivos',
          component: DispositivosPantalla,
          meta: {
            description: 'Dispositivos',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Dispositivos,
          },
        },
        {
          path: 'busca-vehiculo',
          component: BuscaVehiculo,
          meta: {
            description: 'busca vehiculo',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.BuscaVehiculo,
          },
        },
        {
          path: 'historico-mantenimiento',
          component: HistoricoMantenimientoPantalla,
          meta: {
            description: 'Histórico De Mantenimiento',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.HistoricoMantenimiento,
          },
        },
        {
          path: 'contrato-proveedor',
          component: ContratoProveedorPantalla,
          meta: {
            description: 'Contrato Proveedor',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ContratoProveedor,
          },
        },
        {
          path: 'envio-informacion',
          component: EnvioInformacionPantalla,
          meta: {
            description: 'Envío de Información',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.EnvioDeInformacion,
          },
        },
        {
          path: 'Notificaciones',
          component: Notificaciones,
          meta: {
            description: 'Notificaciones',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Notificaciones,
          },
        },
        {
          path: 'funciones-globales',
          component: FuncionesGlobalesPantalla,
          meta: {
            description: 'Funciones Globales',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.FuncionesGlobales,
          },
        },
        {
          path: 'Conductores-copiloto',
          component: ConductoresCopiloto,
          meta: {
            description: 'Conductores Copiloto Virtual',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ConductoresCopiloto,
          },
        },
        {
          path: 'Mensajes-Copiloto',
          component: Mensajes,
          meta: {
            description: 'Mensajes Copiloto Virtual',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Mensajes,
          },
        },
        {
          path: 'Eventos-Copiloto',
          component: Eventos,
          meta: {
            description: 'Eventos Copiloto Virtual',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Eventos,
          },
        },
        {
          path: 'Rutas-Copiloto',
          component: Rutas,
          meta: {
            description: 'Rutas Copiloto Virtual',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Rutas,
          },
        },
        {
          path: 'Sugal',
          component: HomeSugal,
          meta: {
            description: 'Sugal',
            requiresAuth: false,
            moduloCodigo: Funcionalidades.HomeSugal,
          },
        },
        {
          path: 'cargas',
          component: CargasSugal,
          meta: {
            description: 'Cosechadoras',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Cosechadoras,
          },
        },
        {
          path: 'cosechadoras',
          component: Cosechadoras,
          meta: {
            description: 'Cosechadoras',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Cosechadoras,
          },
        },
        {
          path: 'repetir-dia',
          component: RepetirDia,
          meta: {
            description: 'repetir-dia',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.RepetirDia,
          },
        },
        {
          path: 'configurar-landing',
          component: ConfigurarLanding,
          meta: {
            description: 'configurar-landing',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.RepetirDia,
          },
        },
        {
          path: 'menu',
          component: HomeGenerico,
          meta: {
            description: 'menu',
            requiresAuth: true,
            moduloCodigo: null,
          },
        },
        {
          path: 'tracker',
          component: InicioPantalla,
          meta: {
            description: 'Tracker',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Inicio,
          },
        },
        {
          path: 'Alertas-Vigilanti',
          component: AlertasVigilanti,
          meta: {
            description: 'Alertas Vigilanti',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.AlertasVigilanti,
          },
        },
        {
          path: 'Configurar-Alertas',
          component: ConfigurarAlertas,
          meta: {
            description: 'Configurar Alertas',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ConfigurarAlertas,
          },
        },
        {
          path: 'Ramplas',
          component: Ramplas,
          meta: {
            description: 'Ramplas',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Ramplas,
          },
        },
        {
          path: 'Nueva-Solicitud',
          component: NuevaSolicitud,
          meta: {
            description: 'Nueva Solicitud',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.NuevaSolicitud,
          },
        },
        {
          path: 'Ver-Facturacion',
          component: VerFacturacion,
          meta: {
            description: 'Facturación',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.VerFacturacion,
          },
        },
        {
          path: 'Mis-Solicitudes',
          component: MisSolicitudes,
          meta: {
            description: 'Mis Solicitudes',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.MisSolicitudes,
          },
        },
        {
          path: 'Certificados-Sucursal',
          component: InformesGeneradosSV,
          meta: {
            description: 'Emitir Certificado',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.CertificadosSucursal,
          },
        },
        {
          path: 'capacitaciones',
          component: CapacitacionesPantalla,
          meta: {
            description: 'Capacitaciones',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.capacitaciones,
          },
        },
        {
          path: 'Mis-Visitas',
          component: MisVisitas,
          meta: {
            description: 'Visitas',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.MisVisitas,
          },
        },
        {
          //Gorup this in a sub routes.

          path: 'repetir-dia',
          component: RepetirDia,
          meta: {
            description: 'repetir-dia',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.RepetirDia,
          },
        },
        {
          path: 'configurar-landing',
          component: ConfigurarLanding,
          meta: {
            description: 'configurar-landing',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.RepetirDia,
          },
        },
        {
          path: 'menu',
          component: HomeGenerico,
          meta: { moduloCodigo: null },
        },
        {
          path: 'tracker',
          component: InicioPantalla,
          meta: {
            description: 'Tracker',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Inicio,
          },
        },
        {
          path: 'Alertas-Vigilanti',
          component: AlertasVigilanti,
          meta: {
            description: 'Alertas Vigilanti',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.AlertasVigilanti,
          },
        },
        {
          path: 'Configurar-Alertas',
          component: ConfigurarAlertas,
          meta: {
            description: 'Configurar Alertas',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ConfigurarAlertas,
          },
        },
        {
          path: 'consulta-equipos-activos',
          component: ReportesSeriePantalla,
          meta: {
            description: 'Reporte Serie',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ReportesSerie,
          },
        },
        {
          path: 'seguimiento-equipos-terreno',
          component: EquiposEnTerrenoPantalla,
          meta: {
            description: 'Stock Equipos En terreno',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ReportesSerie,
          },
        },
        {
          path: 'estadia-inventario-equipos',
          component: ReportesSerieActivaPantalla,
          meta: {
            description: 'Reporte Serie',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ReporteSerieActiva,
          },
        },
        {
          path: 'inventario-sim',
          component: ReportesInventarioSim,
          meta: {
            description: 'SIM Vista Registros',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.SimRegistros,
          },
        },
        {
          path: 'Sim-Baja-Individual',
          component: SimBajaIndividualPantalla,
          meta: {
            description: 'Sim Baja Individuals',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.SimBajaIndividual,
          },
        },
        {
          path: 'Ramplas',
          component: Ramplas,
          meta: {
            description: 'Ramplas',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Ramplas,
          },
        },
        {
          path: 'Clientes-Conecta',
          component: ClientesConecta,
          meta: {
            description: 'Clientes Conecta',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ClientesConecta,
          },
        },
        {
          path: 'Torre-Control/configuracion-comandos',
          component: ConfiguracionComandosSMSPantalla,
          meta: {
            description: 'Configuración Comandos por SMS',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ConfiguracionComandosSMS,
          },
        },
        {
          path: 'Torre-Control/envio-comandos-sms',
          component: EnvioComandosSMSPantalla,
          meta: {
            description: 'Envío Comandos por SMS',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.EnvioComandosSMS,
          },
        },
        {
          path: 'Torre-Control/reporte-comandos-enviados',
          component: ReportesSMSPantalla,
          meta: {
            description: 'Reporte Comandos Envíados',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.ReportesSMS,
          },
        },
        {
          //Gorup this in a sub routes.
          path: 'Despacho',
          component: Despacho,
          meta: {
            description: 'Despacho',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.Despacho,
          },
        },
        {
          //Gorup this in a sub routes.
          path: 'MantenedorProveedores',
          component: MantenedorProveedores,
          meta: {
            description: 'MantenedorProveedores',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.TablaMantenedorProveedores,
          },
        },
        {
          //Gorup this in a sub routes.
          path: 'MovimientoDispositivos',
          component: MovimientoDispositivos,
          meta: {
            description: 'MovimientoDispositivos',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.MovimientoDispositivos,
          },
        },
        {
          //Gorup this in a sub routes.
          path: 'RecepcionEquipos',
          component: RecepcionEquipos,
          meta: {
            description: 'RecepcionEquipos',
            requiresAuth: true,
            moduloCodigo: Funcionalidades.RecepcionEquipos,
          },
        },
        ...ConectaRoutes,
        ...ComponentsRoutes,
        ...ControlTowerRoutes,
        ...PeajesRoutes,
        ...MedioAmbienteRouter,
      ],
    },
    {
      path: '/registro',
      component: Registro,
      meta: { moduloCodigo: null },
    },
    {
      path: '*',
      component: NotFound,
      meta: { moduloCodigo: null },
    },
  ] as RouteConfig[],
});

router.beforeEach((to, from, next) => {
  eventBusSidebarClick.collapseSidebar(false);
  if (
    to.matched.some(record => record.meta.requiresAuth) &&
    (!router.app.$store.state.token || router.app.$store.state.token === 'null')
  ) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    window.console.log('Not authenticated');

    //Redirección Aceptar Información
    if (to.name === 'aceptarinformacion') {
      window.localStorage.setItem('urlAceptarInformacion', '1');
    } else {
      window.localStorage.setItem('urlAceptarInformacion', '0');
    }
    //---

    next({
      path: '/login',
    });
  } else {
    next();
  }
});

router.beforeEach((to, from, next) => {
  if (store.state.user !== null) {
    var permisos: any[] = store.state.user.permisosUsuario;
    var containVigilanti = permisos.findIndex((item: any) =>
      item.moduloNombre.includes('Vigilanti')
    );
    var containCamera = permisos.findIndex((item: any) =>
      item.moduloNombre.includes('Cámara')
    );
    if (containVigilanti != -1 && containCamera == -1) {
      window.localStorage.setItem('dashboard-vigilanti', '1');
    } else {
      window.localStorage.removeItem('dashboard-vigilanti');
    }
  }

  if (to.path === '/') {
    var homePath = store.state.homePath;

    if (homePath == 'Inicio') {
      return next();
    } else if (homePath == '') {
      return next();
    } else {
      return next('/' + homePath);
    }
  }

  const { moduloCodigo } = to.meta;
  if (moduloCodigo === null) {
    /* Asumir que ausencia explícita de `moduloCodigo` representa una ruta sin
    necesidad de validación de permisos */
    return next();
  }

  const tieneConsultar: AccionesUsuario = store.state.user.permisosUsuario.some(
    (x: AccionesUsuario) =>
      x.moduloCodigo === moduloCodigo &&
      x.accionCodigo === CodigoAccion.Consultar
  );

  if (tieneConsultar) {
    return next();
  } else if (isEmpty(from.meta)) {
    /* Asume que todas las rutas tienen atributo "meta" de acuerdo a definición
    de `RouteConfig`. La ausencia de esta representa una solicitud de ruta
    inicial.
    Usuarios sin permiso de consulta deben ser redirigidos a la página de
    inicio. */
    return next('/');
  } else {
    // TODO notificar falta de permisos de consulta
    return next(false);
  }
});

router.afterEach(() => {
  actionsEvent.removeListeners();
});

export default router;
