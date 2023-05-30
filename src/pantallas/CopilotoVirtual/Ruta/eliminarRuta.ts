import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Ruta } from './rutas';

type DeleteRutaHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Copiloto);

const makeHttpRequest = (
  rta: Ruta
): AxiosPromise<DeleteRutaHttpResponseBody> => {
  return axios.http.delete(`RutaCopiloto/deleteRuta/${rta.id}`);
};

export const eleliminarRuta = (ruta: Ruta) => makeHttpRequest(ruta);
