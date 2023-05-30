import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type getDashboardHtttpResponseBody = any;

const axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  body: any,
  path: any
): AxiosPromise<getDashboardHtttpResponseBody> => {
  return axios.http.post(`Metabase/PostgenericA/` + path, body);
};

export const fetchDashboard = (body: any, path: any) =>
  makeHttpRequest(body, path);
