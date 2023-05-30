import { Filtros } from './ProgramacionInforme';
import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import {
  ProgramacionInforme,
  ProgramacionInformeBackend,
} from '@/pantallas/ProgramacionInforme/ProgramacionInforme';
import { NotificacionInforme } from '@/pantallas/ProgramacionInforme/crearProgramacionInformes';
import { editarNotificacion } from '@/pantallas/ProgramacionInforme/editarNotificacion';

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
}

type EditHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  programacionInforme: ProgramacionInforme
): AxiosPromise<EditHttpResponseBody> => {
  const model: ProgramacionInformeBackend = {
    id: programacionInforme.id,
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
      console.log(programacionInforme.columnasOcultasAlertas);
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
  return axios.http.put('InformeProgramado', model);
};

const parse = (programacion: ProgramacionInforme) => (
  x: EditHttpResponseBody
) => makeNotificacion(programacion);

const makeNotificacion = (
  programacion: ProgramacionInforme
): NotificacionInforme => {
  return {
    id: programacion.notificacionId,
    idProgramacion: programacion.id,
    contactos: programacion.contactos,
    listaDistribuciones: programacion.listasDistribucion,
    usuarios: programacion.usuarios,
    calendarios: programacion.calendarios,
  };
};

export const editarInformeProgramado = (
  programacionInforme: ProgramacionInforme
) =>
  makeHttpRequest(programacionInforme)
    .then(parse(programacionInforme))
    .then(editarNotificacion);
