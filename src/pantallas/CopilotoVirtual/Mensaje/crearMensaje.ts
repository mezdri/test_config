import { MnsajeNuevo } from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';
import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type CrearMensajeHttpResponseBody = unknown;
export type CrearMensajeHttpRequestParams = {
  titulo: string;
  mensaje: string;
  estado: number;
};

const axios = new AxiosVue(ServicioProxy.Copiloto);

const makeHttpRequest = (
  mensaje: MnsajeNuevo
): AxiosPromise<CrearMensajeHttpResponseBody> => {
  const params: CrearMensajeHttpRequestParams = {
    ...mensaje,
  };
  return axios.http.post('MensajeCopiloto/saveMensaje', params);
};

export const crearMensaje = (mensaje: MnsajeNuevo) => makeHttpRequest(mensaje);
