import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type DeleteHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Alerta);

const makeHttpRequest = (id: number): AxiosPromise<DeleteHttpResponseBody> => {
  return axios.http.delete('AlertaBase/' + id);
};

export const eliminarAlertaBase = (id: number) => makeHttpRequest(id);
