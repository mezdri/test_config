import { AxiosPromise } from 'axios';
import { omit } from 'lodash';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { NotificacionInforme } from '@/pantallas/ProgramacionInforme/crearProgramacionInformes';

type CrearNotificacionHttpResponseBody = unknown;
export type CrearNotificacionHttpRequestParams = {
  reporteProgramadoId: number;
  notificaContacto: number[];
  notificaListaDistribucion: number[];
  notificacionUsuario: number[];
  notificacionCalendario: number[];
};

const axios = new AxiosVue(ServicioProxy.Notificacion);

const makeHttpRequest = (
  notificacion: NotificacionInforme
): AxiosPromise<CrearNotificacionHttpResponseBody> => {
  const params: CrearNotificacionHttpRequestParams = {
    reporteProgramadoId: notificacion.idProgramacion,
    notificaContacto: notificacion.contactos,
    notificaListaDistribucion: notificacion.listaDistribuciones,
    notificacionUsuario: notificacion.usuarios,
    notificacionCalendario: notificacion.calendarios,
  };
  return axios.http.post('Notificacion/CreaNotificacion', params);
};

export const crearNotificacion = (notificacion: NotificacionInforme) =>
  makeHttpRequest(notificacion);
