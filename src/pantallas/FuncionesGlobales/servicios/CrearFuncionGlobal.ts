import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type CreateHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  nuevaFuncion: any
): AxiosPromise<CreateHttpResponseBody> => {
  return axios.http.post('FuncionGlobal', nuevaFuncion);
};

export const fetchFuncionGlobal = (nuevaFuncion: any) =>
  makeHttpRequest(nuevaFuncion);
