import { array, number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

const axios = new AxiosVue(ServicioProxy.Sugal);
type HttpResponseBody = unknown;
const makeHttpRequest = (carga: any): AxiosPromise<HttpResponseBody> => {
  return axios.http.post(`Sugal/PostActualizaMaeCarga`, carga);
};

export const postActualizaMaeCarga = (carga: any) =>
  makeHttpRequest(carga).catch(x => {
    // TODO sentry log
    console.error(x);
  });
