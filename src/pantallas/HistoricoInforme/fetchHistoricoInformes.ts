import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type GetHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (): AxiosPromise<GetHttpResponseBody> => {
  return axios.http.get('HistoricoInforme/GetHistoricoInformes/');
};

export const fetchHistoricoInformes = () =>
  makeHttpRequest().catch(x => {
    console.error(x);
  });
