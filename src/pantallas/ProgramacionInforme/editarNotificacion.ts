import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { NotificacionInforme } from '@/pantallas/ProgramacionInforme/crearProgramacionInformes';

type EditarNotificacionHttpResponseBody = unknown;
export type EditarNotificacionHttpRequestParams = {
  id: number;
  reporteProgramadoId: number;
  notificaContacto: number[];
  notificaListaDistribucion: number[];
  notificacionUsuario: number[];
  notificacionCalendario: number[];
};

const axios = new AxiosVue(ServicioProxy.Notificacion);

const makeHttpRequest = (
  notificacion: NotificacionInforme
): AxiosPromise<EditarNotificacionHttpResponseBody> => {
  const params: EditarNotificacionHttpRequestParams = {
    id: notificacion.id,
    reporteProgramadoId: notificacion.idProgramacion,
    notificaContacto: notificacion.contactos,
    notificaListaDistribucion: notificacion.listaDistribuciones,
    notificacionUsuario: notificacion.usuarios,
    notificacionCalendario: notificacion.calendarios,
  };
  return axios.http.put('Notificacion/ActualizaNotificacion', params);
};

export const editarNotificacion = (notificacion: NotificacionInforme) =>
  makeHttpRequest(notificacion);
