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
const rut = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user').replace(/'/g, '"'))
      .rutClienteDefecto
  : '';

const makeHttpRequest = (
  service: string,
  search: string,
  rut: string
): AxiosPromise<MsResponseData> => {
  return axios.http.post(`Metabase/PostgenericA/peajes/` + service, {
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
  body.rut = rut;
  body.cliente_id = localStorage.clienteDefecto;
  return axios.http.post(`Metabase/PostgenericA/peajes/` + service, body);
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

export const fetchPeajes = () =>
  makeHttpRequestNormalized('getPeajes', {}).then(getResponseData);

export const fetchDias = () =>
  makeHttpRequestNormalized('getDias', {}).then(getResponseData);

export const fetchFlotas = (id: string) =>
  makeHttpRequestNormalized('getFlotas', {
    rut: JSON.parse(localStorage.getItem('user').replace(/'/g, '"'))
      .rutClienteDefecto,
    cliente_id: id,
  }).then(getResponseData);

export const fetchHistorico = (id: string, rut: string) =>
  makeHttpRequestNormalized('getHistorico', {
    rut: JSON.parse(localStorage.getItem('user').replace(/'/g, '"'))
      .rutClienteDefecto,
    cliente_id: id,
  }).then(getResponseData);

export const fetchVehiculos = (flotas: any) =>
  makeHttpRequestNormalized('getVehiculos', {
    rut: JSON.parse(localStorage.getItem('user').replace(/'/g, '"'))
      .rutClienteDefecto,
    cliente_id: localStorage.clienteDefecto,
    flotas: flotas,
  }).then(getResponseData);

export const fetchTarifas = (id_peaje: number) =>
  makeHttpRequestNormalized('getTarifasByPeaje', { id_peaje: id_peaje }).then(
    getResponseData
  );

export const postTarifas = (id_peaje: number, data: any) =>
  makeHttpRequestNormalized('postTarifas', {
    id_peaje: id_peaje,
    data: data,
    user_id: user_id,
  }).then(getResponseData);

export const fetchApps = (service: string, params: any) =>
  makeHttpRequestNormalized(service, params);
