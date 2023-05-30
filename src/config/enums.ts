export type RouteViews = 'all' | 'completed' | 'active';

export enum TipoImportacion {
  cargaAcciones = 1,
  cargaRoles = 2,
  cargaUsuarios = 3,
  cargaPerfiles = 4,
}

export enum TipoExportacion {
  exportarExcel = 1,
  exportarCsv = 2,
}

export enum EstadoEntidad {
  Inactivo = 0,
  Activo = 1,
  Eliminado = 2,
  Sistema = 3,
  BloqueadoPorEjecutivo = 4,
  BloqueadoPorIntentos = 5,
}

export enum ServicioProxy {
  Cliente = 2,
  GestionUsuario = 3,
  Gps = 4,
  Sitio = 6,
  Vehiculo = 7,
  Auth = 8,
  Reporte = 9,
  Alerta = 10,
  Importacion = 11,
  Contacto = 12,
  Mantenimiento = 13,
  Integracion,
  Calendario = 15,
  Notificacion = 16,
  Comercial = 17,
  Dispositivo = 18,
  Metabase = 19,
  Copiloto = 20,
  Sugal = 21,
  // Asignacion = 22
  ApiGps = 24,
  MS = 22,
  MSLOGIN = 23,
}

export enum TipoSim {
  Nacional = 1,
  Global = 2,
}

export enum MarcaGps {
  Calamp = 1,
  Enfora = 2,
  Syrus = 3,
  Teltonika = 4,
  Howen = 5,
  Ruptela = 6,
}

export enum UnidadDeTiempo {
  Minutos = 1,
  Horas = 2,
  Días = 3,
}

export enum TipoConfiguracion {
  Sistema = 1,
  Cliente = 2,
}

export enum EstadoAuditoria {
  // Separado = 0,
  // "Sin Cambios" = 1,
  // Borrado = 2,
  // Modificado = 3,
  // Agregado = 4

  Eliminación = 2,
  Modificación = 3,
  Creación = 4,
}

export enum FiltroAsocVehiculo {
  Patente = 1,
  Vin = 2,
}

export enum TipoGeometria {
  Poligono = 1,
  Circunferencia = 2,
  Rectangulo = 3,
  Marcador = 4,
}

export enum TiposZonas {
  Sitio = 1,
  Geocerca = 2,
  Marcador = 3,
}

export enum FiltrosTiposZonas {
  Todos = 0,
  Sitio = 1,
  Geocerca = 2,
  Marcador = 3,
}

export enum EstadoZona {
  Inactivo = 0,
  Activo = 1,
  Bloqueado = 2,
}
export enum Accion {
  NoRecibirInformacion = 0,
  Eliminar = 1,
  Editar = 2,
  VerDetalle = 3,
  CambiarEstado = 4,
  AceptarInformacionCompartida = 5,
  RechazarInformacionCompartida = 6,
  DejarRecibirInformacion = 7,
  Desbloquear = 8,
  Cancelar = 9,
  Descargar = 10,
  CambiarPassword = 11,
  Enviar = 90,
  VerPdf = 89,
  VerReferencia = 91,
  cargarArchivo = 93,
  compartir = 47,
  EnviarComando = 95,
  Anular = 94,
  EliminarApn = 96,
  EditarApn = 97,
  EliminarStock = 98,
  EditarStock = 99,
  EliminarApnCrear = 100,
  EditarApnCrear = 101,
  EliminarStockCrear = 102,
  EditarStockCrear = 103,
  EliminarPlan = 104,
  EditarPlan = 105,
  Exportar_A_CRM = 106,
}

export enum HomeFiltros {
  Flota = 0,
  Etiqueta = 1,
  Vehículo = 2,
}
export enum TipoSitiosSugal {
  Punto_Prohibido = 7,
  Fundo = 8,
  Planta_Talca = 9,
  Planta_Tilcoco = 10,
}

export enum CapasInformacion {
  Tipo_de_lugar = 0,
  Tipo_de_lugar_de_interés = 1,
  Geocercas = 2,
  Sitios = 3,
  Marcadores = 4,
}

export enum TipoLugarAlcance {
  Cliente = 1,
  GPS = 2,
}

export enum FiltrosTiposLugarInteres {
  Todos = 0,
  Sitio = 1,
  Marcador = 3,
}

export enum EstadoEnvioGps {
  Pendiente_de_enviar_a_GPS = 0,
  Enviado_y_esperando_respuesta = 1,
  Enviado_y_recibido_correctamente = 2,
  Enviado_y_no_recibido = 3,
  Enviado_y_con_error = 4,
  Geocercas_eliminadas = 5,
  Error_de_comunicacion = 6,
}

export enum EstadoTransmision {
  Transmitiendo = 0,
  SinTransmitir = 1,
  Seleccionado = 2,
  VelocidadExcedida = 3,
  SinVelocidadExcedida = 4,
  RutaProvisoria = 5,
}

export enum EstadoCompartirInformacion {
  PendienteDeAceptacion = 0,
  Aceptada = 1,
  Rechazada = 2,
  DejarDeCompartir = 3,
  DejarDeRecibir = 4,
  CompartidoEnFlota = 5,
}

export enum EstadoAceptarInformacion {
  Pendiente = 0,
  Aceptada = 1,
  Rechazada = 2,
  DejadaDeCompartirPorElCliente = 3,
  DejarDeRecibir = 4,
  CompartidoEnFlota = 5,
}

export enum TipoRol {
  Local = 0,
  Cliente = 1,
  Gestión = 2,
  Operación = 3,
}

export enum TipoUsuario {
  Ninguno = 0,
  Local = 1,
  Transversal = 2,
}

export enum TipoCompartir {
  Flota = 1,
  Vehículo = 2,
}

export enum TipoActividadesMantenimiento {
  Cambiar = 0,
  Realizar = 1,
  Inspeccionar = 2,
}

export enum TipoFrecuencias {
  Dias = 0,
  Semanas = 1,
  Meses = 2,
}

export enum CategoriaTipoMantenimiento {
  Preventiva = 1,
  Correctiva = 2,
}

export enum TipoFrecuenciasCalendario {
  Diaria = 0,
  Semanal = 1,
  Mensual = 2,
  Anual = 3,
}

export enum TipoAlertaBase {
  AlertaGenerica = 0,
  AlertaZona = 1,
  AlertaRuta = 2,
  AlertaUsoNoAutorizado = 3,
  AlertaDetencionNoAutorizada = 4,
  AlertaMantencionPorVencer = 5,
  AlertaMantencionVencida = 6,
}

export enum aplicacion {
  avlTrack = 1,
  Sugal = 2,
}
