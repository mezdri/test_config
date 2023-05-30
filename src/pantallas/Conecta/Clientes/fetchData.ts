import { object, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

export type MsResponseData = {
  CODIGO_RESPUESTA: string;
  MENSAJE_RESPUESTA: string;
  data: any[];
};

type GiroHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Metabase);

const user_id = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user')).id
  : '';

const makeHttpRequest = (
  service: string,
  search: string,
  rut: string
): AxiosPromise<MsResponseData> => {
  return axios.http.post(`Metabase/PostgenericA/conecta/` + service, {
    search: search,
    rut: rut,
    user_id: user_id,
  });
};

const makeHttpRequestNormalized = (
  service: string,
  body: any
): AxiosPromise<MsResponseData> => {
  body.user_id = user_id;
  return axios.http.post(`Metabase/PostgenericA/conecta/` + service, body);
};

const getResponseData = (
  axiosResponse: AxiosResponse<MsResponseData>
): MsResponseData => {
  try {
    const x = axiosResponse.data;
    return x != undefined ? x : null;
  } catch {
    return null;
  }
};

export const fetchClientes = (id: string, rut: string) =>
  makeHttpRequest('getCliente', id, rut).then(getResponseData);

export const fetchVehiculos = (search: string, rut: string) =>
  makeHttpRequest('getVehiculos', search, rut).then(getResponseData);

export const fetchApps = (service: string, params: any) =>
  makeHttpRequestNormalized(service, params);
