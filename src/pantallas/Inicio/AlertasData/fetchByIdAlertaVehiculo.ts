import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AlertaVehiculo } from '@/interfaces/Alertas';
import moment from 'moment';
import { makeNullableMoment } from '@/reusable/Data/dataUtils';

type HttpResponseBody = AlertaVehiculo;

const axios = new AxiosVue(ServicioProxy.Alerta);

const makeHttpRequest = (alertaId: number): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('/Alerta/AlertaDetalle/' + alertaId);
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): AlertaVehiculo => {
  try {
    const maybe = axiosResponse.data;
    return maybe;
  } catch {
    return null;
  }
};

const schema = object({
  alertaId: string().ensure(),
  fechaCreacion: string().ensure(),
  velocidadActual: string().ensure(),
  actividad: string().ensure(),
  flota: string().ensure(),
  fechaActFin: string().ensure(),
  horometro: string().ensure(),
  minutos: string().ensure(),
  conductor: string().ensure(),
  velocidadMaxima: string().ensure(),
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
  fechaCreacion: moment(a.fecha),
  velocidadActual: a.velocidadActual,
  actividad: {
    velocidadMaxima: a.actividad.velocidadMaxima,
    geocerca: a.actividad.geocerca,
    fechaActividad: makeNullableMoment(a.actividad.fechaActividad),
    distanciaAcumulada: a.actividad.distanciaAcumulada,
    ubicacion: a.actividad.ubicacion,
    heading: a.actividad.heading,
    conductor: a.actividad.conductor,
  },
  zona: a.zona,
  flota: a.flota,
  fechaActFin: moment(a.fechaActFin),
  horometro: a.horometro,
  minutos: a.minutos,
  conductor: a.conductor,
  velocidadMaxima: a.velocidadMaxima,
  kmAcumulados: a.kmAcumulados,
});

export const fetchByIdAlertaVehiculo = (
  alertaId: number
): Promise<AlertaVehiculo> =>
  makeHttpRequest(alertaId)
    .then(getResponseData)
    .then(getMaybeValid)
    .then(parseAlertaVehiculo);
