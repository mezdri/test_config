import { AxiosPromise } from 'axios';
import { omit } from 'lodash';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { NotificacionPlanMantenimiento } from './PlanMantenimiento';

type EditarNotificacionHttpResponseBody = unknown;
export type EditarNotificacionHttpRequestParams = {
  id: number;
  mantenimientoId: number;
  notificaContacto: number[];
  notificaListaDistribucion: number[];
  notificacionCalendario: number[];
  notificacionUsuario: number[];
};

const axios = new AxiosVue(ServicioProxy.Notificacion);

const makeHttpRequest = (
  notificacion: NotificacionPlanMantenimiento
): AxiosPromise<EditarNotificacionHttpResponseBody> => {
  const params: EditarNotificacionHttpRequestParams = {
    id: notificacion.id,
    mantenimientoId: notificacion.idPlan,
    notificaContacto: notificacion.contactos,
    notificaListaDistribucion: notificacion.listaDistribuciones,
    notificacionUsuario: notificacion.usuarios,
    notificacionCalendario: notificacion.calendarios,
  };
  return axios.http.put('Notificacion/ActualizaNotificacion', params);
};

export const editarNotificacion = (
  notificacion: NotificacionPlanMantenimiento
) => makeHttpRequest(notificacion);
