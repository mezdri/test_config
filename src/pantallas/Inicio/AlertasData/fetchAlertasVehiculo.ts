import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AlertaVehiculo } from '@/interfaces/Alertas';
import moment from 'moment';
import { RepetirDiaRequest } from '../RepetirDiaData/fetchRepetirDia';

type HttpResponseBody = AlertaVehiculo;

export type AlertRepetirDiaHttpResponseBody = {
  data?: unknown;
};
export type AlertRepetirDiaHttpRequestBody = {
  params: RepetirDiaRequest;
};

const axios = new AxiosVue(ServicioProxy.Alerta);

const makeHttpRequest = (
  vehiculoId: number
): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('/Alerta/AlertasVehiculo/' + vehiculoId);
};

const makeHttpRequestRepetirDia = (
  params: RepetirDiaRequest
): AxiosPromise<AlertRepetirDiaHttpResponseBody> => {
  const body: AlertRepetirDiaHttpRequestBody = { params };
  return axios.http.get(`/Alerta/AlertasVehiculoRepetirDia`, body);
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): AlertaVehiculo[] => {
  try {
    const maybe = axiosResponse.data;
    return maybe instanceof Array ? maybe : [];
  } catch {
    return [];
  }
};

const getResponseDataReperitDia = (
  axiosResponse: AxiosResponse<AlertRepetirDiaHttpResponseBody>
): AlertaVehiculo[] => {
  try {
    const maybe = axiosResponse.data;
    return maybe instanceof Array ? maybe : [];
  } catch {
    return [];
  }
};

const schema = object({
  alertaId: string().ensure(),
  color: string().ensure(),
  fechaCreacion: string().ensure(),
  tipoAlerta: string().ensure(),
  nombre: string().ensure(),
  mensaje: string().ensure(),
  longitudInicioExceso: string().ensure(),
  longitudFinExceso: string().ensure(),
  latitudInicioExceso: string().ensure(),
  latitudFinExceso: string().ensure(),
  alertaConfigId: string().ensure(),
});

const getMaybeValid = (
  alertaVehiculo: AlertaVehiculo
): Promise<AlertaVehiculo | null> => {
  return schema
    .isValid(alertaVehiculo, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? alertaVehiculo : null));
};

const parseAlertaVehiculo = (a: AlertaVehiculo): AlertaVehiculo => ({
  alertaId: a.alertaId,
  color: a.color,
  fechaCreacion: moment(a.fechaCreacion),
  tipoAlerta: a.tipoAlerta,
  nombre: a.nombre,
  mensaje: a.mensaje,
  zona: a.zona,
  longitudInicioExceso: a.longitudInicioExceso,
  longitudFinExceso: a.longitudFinExceso,
  latitudInicioExceso: a.latitudInicioExceso,
  latitudFinExceso: a.latitudFinExceso,
  alertaConfigId: a.alertaConfigId,
  kmAcumulados: a.kmAcumulados,
});

export const fetchAlertasVehiculo = (
  vehiculoId: number
): Promise<AlertaVehiculo[]> =>
  makeHttpRequest(vehiculoId)
    .then(getResponseData)
    .then((c): Promise<Array<any | null>> => Promise.all(c.map(getMaybeValid)))
    .then(c => c.filter(x => x))
    .then(c => c.map(parseAlertaVehiculo));

export const fecthAlertasRepetirDia = (
  params: RepetirDiaRequest
): Promise<AlertaVehiculo[]> =>
  makeHttpRequestRepetirDia(params)
    .then(getResponseDataReperitDia)
    .then((c): Promise<Array<any | null>> => Promise.all(c.map(getMaybeValid)))
    .then(c => c.filter(x => x))
    .then(c => c.map(parseAlertaVehiculo));
