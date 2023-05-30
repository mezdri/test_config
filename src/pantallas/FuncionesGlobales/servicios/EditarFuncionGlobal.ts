import { FuncionGlobal } from './Funciones';
import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type EditHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  funcionUpdate: FuncionGlobal
): AxiosPromise<EditHttpResponseBody> => {
  return axios.http.put('FuncionGlobal', funcionUpdate);
};

export const editarFuncionGlobal = (funcionUpdate: any) =>
  makeHttpRequest(funcionUpdate);
