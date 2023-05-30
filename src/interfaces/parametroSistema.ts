import { TipoConfiguracion, EstadoEntidad } from '@/config/enums';

export class ParametroSistemaVm {
  id?: number;
  clienteId?: number;
  tipoConfiguracion?: TipoConfiguracion;
  refrescoVisualizacionMapaSegundos: string;
  expiracionVariablesSesionHoras?: string;
  eliminacionNotificacionesDias?: string;
  eliminacionAlertasHoras?: string;
  reintentosFallidosAutenticacion?: number;
  actualizacionEstadoConexionGps?: string;
  caducidadLinkSolicitudCambioContrasena?: string;
  eliminacionNotificacionesConfigurableCliente?: boolean;
  eliminacionAlertasConfigurableCliente?: boolean;
  actualizacionEstadoConexionGpsConfigurableCliente?: boolean;
  refrescarVisualizacionMapaConfigurableCliente?: boolean;
  expiracionVariablesSesionConfigurableCliente?: boolean;
  estado?: EstadoEntidad;
  usuarioCreadorId?: number;
  usuarioModificacionId?: number;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  caducidadContrasenaDias?: number; // expiracion de contrasena
  tiempoVisualizacionNotificaciones?: string;
  tiempoDescanso?: string;
  tiempoDescansoConIntervalos?: string;
  tiempoDescansoIntervalos?: string;
  tiempoVisualizacionCampana?: string;
  tiempoVisualizacionPopup?: string;
  tiempAlmacenamientoInformeProgramado?: number;
  tiempoVisualizacionCampanaConfigurableCliente?: boolean;
  tiempoVisualizacionPopupConfigurableCliente?: boolean;
}
