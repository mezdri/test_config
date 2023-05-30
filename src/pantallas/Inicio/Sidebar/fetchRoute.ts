import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Funcionalidades } from '@/config/funcionalidades';
import Router, {
  RouteConfig,
  RouteConfig as RouteConfigBase,
} from 'vue-router';

const axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (): AxiosPromise<any> => {
  return axios.http.post(`Metabase/PostgenericA/track/getRoutes`);
};

export const fetchRoute = () => makeHttpRequest();
