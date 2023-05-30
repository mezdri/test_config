import { AxiosPromise } from 'axios';
import { ServicioProxy } from '../../../config/enums';
import { AxiosVue } from '../../../AxiosVue';

type getDashboardHtttpResponseBody = any;

const axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  body: any,
  path: string
): AxiosPromise<getDashboardHtttpResponseBody> => {
  return axios.http.post(`Metabase/PostgenericA/` + path, body);
};

export const fetchMantenedorCoordinador = (body: any, path: string) =>
  makeHttpRequest(body, path);
