import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type DeleteProveedorHttpResponseBody = unknown;
export type DeleteFuncionHttpRequestParams = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  idFuncion: number
): AxiosPromise<DeleteFuncionHttpRequestParams> => {
  var id = idFuncion;
  return axios.http.delete('FuncionGlobal/' + id);
};

export const deleteFuncionGlobal = (idFuncion: number) =>
  makeHttpRequest(idFuncion);
