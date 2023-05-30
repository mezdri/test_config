import { Filtros } from './ProgramacionInforme';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { object, number } from 'yup';
import { ServicioProxy } from '@/config/enums';
import {
  ProgramacionInforme,
  ProgramacionInformeBackend,
} from '@/pantallas/ProgramacionInforme/ProgramacionInforme';
import { crearNotificacion } from '@/pantallas/ProgramacionInforme/crearNotificacion';

export enum TipoDeInforme {
  Actividad = 1,
  Kilometraje = 2,
  DetalleViaje = 3,
  Sitio = 4,
  Exceso_velocidad = 7,
  Alerta = 13,
  Consolidado = 14,
  Detencion = 15,
  Exceso_velocidad_sitio = 16,
  Geotec = 19,
}

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  programacionInforme: ProgramacionInforme
): AxiosPromise<CrearInformeHttpResponseBody> => {
  let model: ProgramacionInformeBackend = {
    nombre: programacionInforme.nombre,
    formato: programacionInforme.formato,
    notificaBrowser: programacionInforme.notificaBrowser,
    notificaGps: programacionInforme.notificaGps,
    notificaEmail: programacionInforme.notificaEmail,
    periodo: programacionInforme.periodo,
    estado: programacionInforme.estado,
    vehiculos: programacionInforme.vehiculos,
    tipoInformeId: programacionInforme.tipoInformeId,
    nombreServicio: programacionInforme.nombreServicio,
  };

  //Logica periodos de informes
  if (programacionInforme.periodo.tipo !== 1) {
    model.periodo.periodoDesde = null;
    model.periodo.periodoHasta = null;
    switch (programacionInforme.periodo.tipo) {
      case 2:
        model.periodo.multiploDias =
          programacionInforme.periodo.multiploPeriodo;
        break;
      case 3:
        model.periodo.multiploSemanas =
          programacionInforme.periodo.multiploPeriodo;
        break;
      case 4:
        model.periodo.multiploMes = programacionInforme.periodo.multiploPeriodo;
        break;
      default:
        break;
    }
  }
  switch (model.nombreServicio) {
    case 'actividades':
      model.actividades = programacionInforme.actividadTipo;
      model.columnasOcultas = programacionInforme.columnasOcultas;
      model.actividadesTipos = programacionInforme.actividadesTiposNombre;
      model.filtros = [];
      break;

    case 'detalle_viaje':
      model.mostrarSitioDetalleViaje =
        programacionInforme.mostrarSitioDetalleViaje;
      model.filtros = [];
      break;

    case 'sitios':
      model.zonas = programacionInforme.zonas;
      model.zonasNombre = programacionInforme.zonasNombre;
      model.tipoZona = programacionInforme.tipoZona;
      model.filtros = [];
      break;

    case 'detencion':
      model.tiempoDetencion = programacionInforme.tiempoDetencion;
      model.diasDetencion = programacionInforme.diasDetencion;
      model.horasDetencion = programacionInforme.horasDetencion;
      model.minutosDetencion = programacionInforme.minutosDetencion;
      model.mostrarSitioDetencion = programacionInforme.mostrarSitioDetencion;
      model.filtros = [];
      break;

    case 'alertas':
      model.alertaBaseId = programacionInforme.alertaBaseId;
      model.alertaBaseCliente = programacionInforme.alertaBaseCliente;
      model.columnasOcultasAlertas = programacionInforme.columnasOcultasAlertas;
      model.filtros = [];
      break;
    case 'exceso_velocidad':
      model.limiteVelocidad = programacionInforme.limiteVelocidad;
      model.precisionHdop = programacionInforme.precisionHdop;
      model.precisionSatelites = programacionInforme.precisionSatelites;
      model.filtros = [];
      break;
    case 'velocidad_sitios':
      model.mostrarEtiquetasEVS = programacionInforme.mostrarEtiquetasEVS;
      model.filtros = [];
      break;
    case 'consolidado_pelambres':
      model.proveedores = programacionInforme.proveedores;
      model.filtros = [];
      break;

    default:
      model.filtros = [];
      break;
  }
  return axios.http.post('InformeProgramado', model);
};

type CrearInformeHttpResponseBody = {
  id: number;
  nombre: string;
  estado: number;
  tipoMantenimientoId: number;
};

const getResponseData = (
  axiosResponse: AxiosResponse<CrearInformeHttpResponseBody>
): CrearInformeHttpResponseBody => axiosResponse.data;

const schema = object({
  id: number(),
});

const getMaybeValidData = (
  response: CrearInformeHttpResponseBody
): Promise<CrearInformeHttpResponseBody | null> => {
  return schema
    .isValid(response, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? response : null));
};

const parse = (programacion: ProgramacionInforme) => (
  x: CrearInformeHttpResponseBody
) => makeNotificacion(programacion, x.id);

const makeNotificacion = (
  programacion: ProgramacionInforme,
  idProgramacion: number
): NotificacionInforme => {
  return {
    idProgramacion: idProgramacion,
    contactos: programacion.contactos,
    listaDistribuciones: programacion.listasDistribucion,
    usuarios: programacion.usuarios,
    calendarios: programacion.calendarios,
  };
};

export const crearInformeProgramado = (
  programacionInforme: ProgramacionInforme
) =>
  makeHttpRequest(programacionInforme)
    .then(getResponseData)
    .then(getMaybeValidData)
    .then(parse(programacionInforme))
    .then(crearNotificacion);

export type NotificacionInforme = {
  id?: number;
  idProgramacion?: number;
  contactos: number[];
  usuarios: number[];
  listaDistribuciones: number[];
  calendarios: number[];
};
