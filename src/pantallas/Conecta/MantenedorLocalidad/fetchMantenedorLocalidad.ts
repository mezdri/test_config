import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type getDashboardHtttpResponseBody = any;

const axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  body: any,
  path: string
): AxiosPromise<getDashboardHtttpResponseBody> =>
  axios.http.post(`Metabase/PostgenericA/` + path, body);

export const fetchMantenedorLocalidad = (body: any, path: string) =>
  makeHttpRequest(body, path);
