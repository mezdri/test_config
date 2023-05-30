import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type DeleteHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Comercial);

const makeHttpRequest = (id: number): AxiosPromise<DeleteHttpResponseBody> => {
  return axios.http.delete('CertificadosBase/' + id + '/EliminaCertificado');
};

export const eliminarCertificado = (id: number) => makeHttpRequest(id);
