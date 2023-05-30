import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type getDashboardHtttpResponseBody = any;

const axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  body: any
): AxiosPromise<getDashboardHtttpResponseBody> => {
  return axios.http.post(`Metabase/PostgenericA/camaras/getWidgets`, body);
};

export const fetchAlertasWidgets = (body: any) => makeHttpRequest(body);

export type AlertaWidget = {
  tipo_alarma: string;
  total: number;
  id: string;
};
