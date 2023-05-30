import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type GetHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (id: number): AxiosPromise<GetHttpResponseBody> => {
  return axios.http.get('Integracion/Envio/ChequearAsociacion/' + id);
};

export const chequearEnvio = (id: number) => makeHttpRequest(id);
