import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type getDashboardHtttpResponseBody = any;

const axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  body: any,
  path: string
): AxiosPromise<getDashboardHtttpResponseBody> => {
  return axios.http.post(`Metabase/PostgenericA/servipag/` + path, body);
};

export const requestMS = (body: any, path: string) =>
  makeHttpRequest(body, path);
