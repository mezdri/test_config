import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type getDashboardHtttpResponseBody = any;

const axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);
const routePatent: string = 'camaras/getPatentCameras';
const routeHistoricCamera: string = 'camaras/getHistoricCameras';

const makeHttpRequest = (
  body: any,
  path: string
): AxiosPromise<getDashboardHtttpResponseBody> => {
  return axios.http.post(`Metabase/PostgenericA/` + path, body);
};

export const fetchOrdenesCompra = (body: any, path: string) =>
  makeHttpRequest(body, path);
