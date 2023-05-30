import { AxiosPromise } from 'axios';
import { omit } from 'lodash';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import {
  ContactosPlanMantenimiento,
  ListaDistribucionPlanMantenimiento,
  CalendarioPlanMantenimiento,
  NotificacionPlanMantenimiento,
} from './PlanMantenimiento';

type CrearNotificacionHttpResponseBody = unknown;
export type CrearNotificacionHttpRequestParams = {
  mantenimientoId: number;
  notificaContacto: number[];
  notificaListaDistribucion: number[];
  notificacionUsuario: number[];
  notificacionCalendario: number[];
};

const axios = new AxiosVue(ServicioProxy.Notificacion);

const makeHttpRequest = (
  notificacion: NotificacionPlanMantenimiento
): AxiosPromise<CrearNotificacionHttpResponseBody> => {
  const params: CrearNotificacionHttpRequestParams = {
    mantenimientoId: notificacion.idPlan,
    notificaContacto: notificacion.contactos,
    notificaListaDistribucion: notificacion.listaDistribuciones,
    notificacionUsuario: notificacion.usuarios,
    notificacionCalendario: notificacion.calendarios,
  };
  return axios.http.post('Notificacion/CreaNotificacion', params);
};

export const crearNotificacion = (
  notificacion: NotificacionPlanMantenimiento
) => makeHttpRequest(notificacion);
