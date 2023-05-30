import { array, number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

const axios = new AxiosVue(ServicioProxy.Vehiculo);
type HttpResponseBody = unknown;
const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get(`vehiculo/GetVehiculosPlataforma`);
};

export const fetchVehiculosTodos = () =>
  makeHttpRequest().catch(x => {
    // TODO sentry log
    console.error(x);
  });
