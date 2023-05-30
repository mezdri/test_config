import { AxiosVue } from '@/AxiosVue';
import { AxiosPromise } from 'axios';
import { ServicioProxy } from '@/config/enums';

type getDashboardHttpResponseBody = any;
const axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  path: string,
  body: any
): AxiosPromise<getDashboardHttpResponseBody> => {
  return axios.http.post(
    'Metabase/PostgenericA/conectaConfigAutorizaciones/' + path,
    body
  );
};

export const fetchConfigAutorizaciones = (path: string, body: any) =>
  makeHttpRequest(path, body);
