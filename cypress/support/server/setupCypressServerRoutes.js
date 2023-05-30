import getUsuario from './responses/getUsuario';
import postLogin from './responses/postLogin';
import getEstadoUi from './responses/getEstadoUi';
import getTiposLugarCliente from './responses/getTiposLugarCliente';
import getClientes from './responses/getClientes';
import putEstadoGrilla from './responses/putEstadoGrilla';
import postEstadoGrilla from './responses/postEstadoGrilla';
import getActividadesVehiculo, {
  getActividadesVehiculoVacio,
} from './responses/getActividadesVehiculo';
import getFlota from './responses/getFlota';
import getParametrosSistema from './responses/getParametrosSistema';
import getParametrosCliente from './responses/getParametrosCliente';
import getGrillaVehiculos from './responses/getGrillaVehiculos';
import getContactos from './responses/getContactos';
import getRecepciones from './responses/getRecepciones';
import getPautasActividades from './responses/getPautasActividades';
import getProveedoresGps from './responses/getProveedoresGps';
import getClientesProveedorGps from './responses/getClientesProveedorGps';
import getFlotasEtiquetasVehiculos from './responses/getFlotasEtiquetasVehiculos';
import getRecepcion from './responses/getRecepcion';
import getTiposContacto from './responses/getTiposContacto';
import getTipoMedida from './responses/getTiposMedida';
import getTiposLugarClienteGrupoZonas from './responses/getTiposLugarClienteGrupoZonas';
import getGiro from './responses/getGiro';
import getContactoEjecutivoComercial from './responses/getContactoEjecutivoComercial';
import getDescargas from './responses/getDescargasActividad';
import getDescargaActividad from './responses/getDescargaActividad';
import getTiposActividad from './responses/alertas/getTiposActividad';
import getCampos from './responses/getCampos';
import getDispositivos from './responses/getDispositivos';
import getTipoDispositivo from './responses/getTipoDispositivos';
import respuesta from './responses/validarCampoUnico';

const setupAuthRoutes = () => {
  cy.route(
    '/servicios-auth/api/Cuenta/nombreUsuario?email=*',
    getUsuario
  ).route('POST', '/servicios-auth/api/Cuenta/login', postLogin);
};

const setupUsuariosRoutes = () =>
  cy
    // TODO eliminar `/` innecesario en código de aplicación
    .route(/\/servicios-usuarios\/api\/EstadoUi\/?.*/, getEstadoUi)
    .route('PUT', '/servicios-usuarios/api/EstadoUi', getEstadoUi)
    .route('/servicios-usuarios/api/usuario/2/cliente', getClientes)
    .route(/\/servicios-usuarios\/api\/EstadoGrilla\/\d+\/\d+/i, '')
    .route('PUT', '/servicios-usuarios/api/EstadoGrilla', putEstadoGrilla)
    .route('POST', '/servicios-usuarios/api/EstadoGrilla', postEstadoGrilla)
    .route(
      '/servicios-usuarios/api/ParametroSistema/sistema',
      getParametrosSistema
    )
    .route(
      '/servicios-usuarios/api/ParametroSistema/*/cliente',
      getParametrosCliente
    )
    .route('/servicios-contacto/api/TipoContactos/grid2', getTiposContacto);

const setupVehiculosRoutes = () =>
  cy
    .route('/servicios-vehiculos/api/flota/*/usuarioflota/', getFlota)
    .route(
      'POST',
      '/servicios-vehiculos/api/Vehiculo/grillaVehiculos',
      getGrillaVehiculos
    );

const setupActividadesRoutes = () =>
  cy
    .route(
      /\/servicios-vehiculos\/api\/Actividad\/0\/grid?.*/,
      getActividadesVehiculoVacio
    )
    .route(
      /\/servicios-vehiculos\/api\/Actividad\/(?!0).*\/grid?.*/,
      getActividadesVehiculo
    );

const setupComercialRoutes = () =>
  cy.route(
    /servicios-comercial\/api\/comercial\/contactoejecutivocomercial/i,
    getContactoEjecutivoComercial
  );

const setupIntegracionRoutes = () =>
  cy
    .route('/servicios-integracion/api/integracion/recepciones', getRecepciones)
    .route(
      /\/servicios-integracion\/api\/integracion\/recepciones\/\d/,
      getRecepcion
    )
    .route('POST', /\/servicios-integracion\/api\/integracion\/recepciones/, '')
    .route('PUT', /\/servicios-integracion\/api\/integracion\/recepciones/, '')
    .route('DELETE', '/servicios-integracion/api/integracion/recepciones', '')
    .as('recepcionActividad-delete')
    .route(/\/servicios-integracion\/api\/proveedor\/grid2/i, getProveedoresGps)
    .route(
      '/servicios-integracion/api/clienteProveedor/grid2',
      getClientesProveedorGps
    )
    .route('servicios-integracion/api/Giro/grid2', getGiro)
    .route(/\/servicios-integracion\/api\/integracion\/descarga/i, getDescargas)
    .route(
      /\/servicios-integracion\/api\/integracion\/descarga\/\d+/i,
      getDescargaActividad
    )
    .route('POST', /\/servicios-integracion\/api\/integracion\/descarga/i, '')
    .route('PUT', /\/servicios-integracion\/api\/integracion\/descarga/i, '')
    .route('DELETE', /\/servicios-integracion\/api\/integracion\/descarga/i, '')
    .as('descargaActividad-delete')
    .route(/\/servicios-integracion\/api\/integracion\/campo/i, getCampos);

const setupServiciosAlertaRoutes = () =>
  cy
    .route('/servicios-alertas/api/AlertaNotificacion/4', [])
    .route(
      '/servicios-alertas/api/AlertaBase/GetTipoActividad',
      getTiposActividad
    );

const setupDispositivoRoutes = () =>
  cy
    .route(/\/servicios-dispositivos\/api\/TipoMedida\/grid2/i, getTipoMedida)
    .route(
      /\/servicios-dispositivos\/api\/TipoDispositivo\/grid2/i,
      getTipoDispositivo
    )
    .route(
      /\/servicios-dispositivos\/api\/dispositivo\/grid2/i,
      getDispositivos
    )
    .route('POST', /\/servicios-dispositivos\/api\/tipomedida/, '')
    .route('POST', /\/servicios-dispositivos\/api\/tipodispositivo/, '')
    .route('POST', /\/servicios-dispositivos\/api\/dispositivo/, '')
    .route('PUT', /\/servicios-dispositivos\/api\/tipomedida/, '')
    .route('PUT', /\/servicios-dispositivos\/api\/tipodispositivo/, '')
    .route('PUT', /\/servicios-dispositivos\/api\/dispositivo/, '')
    .route('DELETE', '/servicios-dispositivos/api/TipoMedida/*', '')
    .as('tipoMedida-delete')
    .route('DELETE', '/servicios-dispositivos/api/TipoDispositivo/*', '')
    .as('tipoDispositivo-delete')
    .route(
      '/servicios-dispositivos/api/tipomedida/ChequearNombreUnico/*/*',
      respuesta
    )
    .route(
      '/servicios-dispositivos/api/tipodispositivo/ChequearNombreUnico/*/*',
      respuesta
    )
    .route(
      '/servicios-dispositivos/api/dispositivo/ChequearIdUnico/*',
      respuesta
    )
    .route(
      '/servicios-dispositivos/api/dispositivo/ChequearNombreUnico/*/*',
      respuesta
    )
    .route(
      '/servicios-dispositivos/api/dispositivo/ChequearNombreUnicoDae/*/*',
      respuesta
    );

export default () => {
  cy.server();

  setupAuthRoutes();
  setupUsuariosRoutes();
  setupVehiculosRoutes();
  setupActividadesRoutes();
  setupComercialRoutes();
  setupIntegracionRoutes();
  setupServiciosAlertaRoutes();
  setupDispositivoRoutes();

  cy.route(
    /*
    TODO unificar url de solicitudes realizadas por la aplicación
    /servicios-gps/api/tipolugar
    /servicios-gps/api/tipoLugar
     */
    /\/servicios-gps\/api\/tipo[lL]ugar\/\d+\/tiposlugarCliente/,
    getTiposLugarCliente
  )
    .route(
      /\/servicios-gps\/api\/grupodezona\/\d\/tiposlugarCliente/i,
      getTiposLugarClienteGrupoZonas
    )
    .route('POST', '/servicios-clientes/api/contactos', getContactos)
    .route('/servicios-reportes/api/Reporte/2/2', getFlotasEtiquetasVehiculos)
    .route(
      'POST',
      '/servicios-mantenimiento/api/PautasActividades',
      getPautasActividades
    );
};
