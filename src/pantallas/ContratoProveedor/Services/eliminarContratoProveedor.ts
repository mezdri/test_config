import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type DeleteHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (id: number): AxiosPromise<DeleteHttpResponseBody> => {
  return axios.http.delete('Integracion/Contrato/?id=' + id);
};

export const eliminarContratoProveedor = (id: number) => makeHttpRequest(id);
