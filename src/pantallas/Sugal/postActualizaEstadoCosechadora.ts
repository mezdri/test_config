import { array, number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

const axios = new AxiosVue(ServicioProxy.Sugal);
type HttpResponseBody = unknown;
const makeHttpRequest = (cosechadora: any): AxiosPromise<HttpResponseBody> => {
  return axios.http.post(`Sugal/PostActualizaEstadoCosechadora`, cosechadora);
};

export const postActualizaEstadoCosechadora = (cosechadora: any) =>
  makeHttpRequest(cosechadora).catch(x => {
    // TODO sentry log
    console.error(x);
  });
