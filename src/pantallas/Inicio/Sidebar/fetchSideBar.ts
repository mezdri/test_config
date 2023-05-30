import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type getDashboardHtttpResponseBody = any;

const axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  body: any
): AxiosPromise<getDashboardHtttpResponseBody> => {
  return axios.http.post(`Metabase/PostgenericA/track/getSideBar`, body);
};

export const fetchSideBar = (body: any) => makeHttpRequest(body);
