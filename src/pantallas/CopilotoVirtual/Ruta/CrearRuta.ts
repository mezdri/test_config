import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Ruta, RutaNueva } from './rutas';

type CrearMensajeHttpResponseBody = unknown;
export type CrearMensajeHttpRequestParams = {
  nombre: string;
};

const axios = new AxiosVue(ServicioProxy.Copiloto);

const makeHttpRequest = (
  ruta: RutaNueva
): AxiosPromise<CrearMensajeHttpResponseBody> => {
  const params: CrearMensajeHttpRequestParams = {
    ...ruta,
  };
  return axios.http.post(`RutaCopiloto/saveRuta`, params);
};

export const CrearRuta = (ruta: Ruta) => makeHttpRequest(ruta);
