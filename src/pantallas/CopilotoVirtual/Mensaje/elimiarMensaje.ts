import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Mensaje } from './mensaje';

type DeleteMensajeHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Copiloto);

const makeHttpRequest = (
  mensaje: Mensaje
): AxiosPromise<DeleteMensajeHttpResponseBody> => {
  return axios.http.delete(`MensajeCopiloto/deleteMensaje/${mensaje.id}`);
};

export const eliminarMensaje = (mensaje: Mensaje) => makeHttpRequest(mensaje);
