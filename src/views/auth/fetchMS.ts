import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type getDashboardHtttpResponseBody = any;

const axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  body: any,
  path: string
): AxiosPromise<getDashboardHtttpResponseBody> => {
  return axios.http.post(`Metabase/PostgenericA/track/` + path, body);
};

export const fetchMS = (body: any, path: string) => makeHttpRequest(body, path);
