import { object } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AlertaBackend } from '@/interfaces/Alertas';

import moment from 'moment';

type HttpResponseBody = AlertaBackend;

const axios = new AxiosVue(ServicioProxy.Alerta);

const makeHttpRequest = (id: number): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('Alerta/' + id + '/GetDetalleAlerta');
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): AlertaBackend => {
  try {
    const maybeAlertas = axiosResponse.data;
    return maybeAlertas;
  } catch {
    return null;
  }
};

const schema = object({});

const getMaybeValidAlerta = (
  alertas: AlertaBackend
): Promise<AlertaBackend | null> => {
  return schema
    .isValid(alertas, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? alertas : null));
};

const parseAlerta = (x: AlertaBackend): AlertaBackend => ({
  id: x.id,
  nombre: x.nombre,
  estado: x.estado,
  alertaBaseTipo: x.alertaBaseTipo,
  alertaBaseId: x.alertaBaseId,
  color: x.color,
  parametroGeneral: x.parametroGeneral ? x.parametroGeneral : false,
  desde: moment(x.desde),
  hasta: moment(x.hasta),
  velMax: x.velMax,
  tolerancia: x.tolerancia,
  eventos: x.eventos,
  temporalidad: x.temporalidad,
  estadoIgnicion: x.estadoIgnicion ? x.estadoIgnicion : false,
  ignicionVelocidad: x.ignicionVelocidad,
  zonas: x.zonas,
  campoDinamico: x.campoDinamico,
  usoNoAutorizado: x.usoNoAutorizado,
  vehiculosId: x.vehiculosId,
  flotasId: x.flotasId,
  etiquetasId: x.etiquetasId,
  notificaGps: x.notificaGps ? x.notificaGps : false,
  notificaBrowser: x.notificaBrowser ? x.notificaBrowser : false,
  notificaEmail: x.notificaEmail ? x.notificaEmail : false,
  notificacionListaDistribucion: x.notificacionListaDistribucion,
  notificacionContacto: x.notificacionContacto,
  notificacionCalendario: x.notificacionCalendario,
  kilometrosMenor: x.kilometrosMenor,
  horasMotorMenor: x.horasMotorMenor,
  tiempoMenor: x.tiempoMenor,
  unidadMedidaTiempo: x.unidadMedidaTiempo,
  planesMantenimientoId: x.planesMantenimientoId,
  tiempoDetencion: x.tiempoDetencion,
  notificacionUsuario: x.notificacionUsuario,
  hdopdesde: x.hdopdesde,
  hdophasta: x.hdophasta,
  nsatelites: x.nsatelites,
});

export const fetchByIdAlerta = (id: number) =>
  makeHttpRequest(id)
    .then(getResponseData)
    .then(getMaybeValidAlerta)
    .then(parseAlerta);
