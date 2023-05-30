import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type GetHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Alerta);

const makeHttpRequest = (id: number): AxiosPromise<GetHttpResponseBody> => {
  return axios.http.get('AlertaBase/' + id + '/Asociada');
};

export const chequearConfiguracionAlerta = (id: number) => makeHttpRequest(id);
