import { Mensaje } from './mensaje';
import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

export type EditarMensajeHttpRequestParams = {
  id: number;
  titulo: string;
  mensaje: string;
  estado: number;
  usuarioModifica: string;
};

const axios = new AxiosVue(ServicioProxy.Copiloto);

const makeHttpRequest = (
  mensaje: Mensaje
): AxiosPromise<EditarMensajeHttpRequestParams> => {
  const params: EditarMensajeHttpRequestParams = {
    ...mensaje,
  };
  return axios.http.put('MensajeCopiloto/updateMensaje', params);
};

export const editarMensaje = (mensaje: Mensaje) => makeHttpRequest(mensaje);
