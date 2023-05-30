import { NotificacionPlanMantenimientoDetalle } from './PlanMantenimiento';
import { object, string, array } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type NotificacionesDetalleBackend = {
  id: number;
  notificaContacto: number[];
  notificaListaDistribucion: number[];
  notificacionUsuario: number[];
  notificacionCalendario: number[];
};

type NotificacionesHttpResponseBody = NotificacionesDetalleBackend;
export type FetchNotificacionesHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
};

const axios = new AxiosVue(ServicioProxy.Notificacion);

const makeHttpRequest = (
  idPlan: number
): AxiosPromise<NotificacionesHttpResponseBody> => {
  return axios.http.get(`Notificacion/0/${idPlan}/GetNotificacion`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<NotificacionesHttpResponseBody>
): NotificacionesDetalleBackend => {
  try {
    if (axiosResponse.data) {
      return axiosResponse.data;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

const schema = object({
  id: string().ensure(),
  notificaContacto: array(string().ensure()),
  notificaListaDistribucion: array(string().ensure()),
  notificacionCalendario: array(string().ensure()),
});

const getMaybeValidRecepcion = (
  notificacion: NotificacionesDetalleBackend
): Promise<NotificacionesDetalleBackend | null> => {
  return schema
    .isValid(notificacion, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? notificacion : null));
};

const parseNotificacion = (
  x: NotificacionesDetalleBackend
): NotificacionPlanMantenimientoDetalle =>
  x
    ? {
        id: x.id,
        calendarios: x.notificacionCalendario.map(calendario => ({
          id: calendario,
        })),
        contactos: x.notificaContacto.map(contacto => ({
          id: contacto,
          nombre: '',
          tipo: 'Contacto',
        })),
        listaDistribuciones: x.notificaListaDistribucion.map(lista => ({
          id: lista,
          nombre: '',
          tipo: 'Lista de Distribución',
        })),
        usuarios: x.notificacionUsuario.map(lista => ({
          id: lista,
          nombre: '',
          tipo: 'Usuario',
        })),
      }
    : null;

export const fetchNotificacionesDetalle = (idPlan: number) =>
  makeHttpRequest(idPlan)
    .then(getResponseData)
    .then(getMaybeValidRecepcion)
    .then(parseNotificacion);
