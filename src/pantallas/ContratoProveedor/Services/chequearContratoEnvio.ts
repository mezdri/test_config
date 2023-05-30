import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type GetHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (id: number): AxiosPromise<GetHttpResponseBody> => {
  return axios.http.get('Integracion/Contrato/ChequearEnEnvio/' + id);
};

export const chequearContratoEnvio = (id: number) => makeHttpRequest(id);
