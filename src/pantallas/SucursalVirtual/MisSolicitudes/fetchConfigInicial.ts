import { object, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

export type ConfigEmpresasBackend = {
  id: string;
  nombre: string;
};
export type ConfigEstadosBackend = {
  id: string;
  nombre: string;
};
export type ConfigCategoriasBackend = {
  header: string;
  id: string;
  nombre: string;
};

type MsDataEmpresas = {
  id: string;
  nombre: string;
};
type MsResponseDataEmpresas = {
  codigo_respuesta: string;
  mensaje_respuesta: string;
  data: Array<MsDataEmpresas>;
};

type MsDataEstados = {
  id: string;
  nombre: string;
};
type MsResponseDataEstados = {
  codigo_respuesta: string;
  mensaje_respuesta: string;
  data: Array<MsDataEmpresas>;
};

type MsDataCategorias = {
  header: string;
  id: string;
  nombre: string;
};

type MsResponseDataCategorias = {
  codigo_respuesta: string;
  mensaje_respuesta: string;
  data: Array<MsDataCategorias>;
};

type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequestEmpresas = (): AxiosPromise<MsResponseDataEmpresas> => {
  //return axios.http.get('api/values/clientes');
  return axios.http.post('Metabase/PostgenericA/busquedas/proxyTrackEmpresas', {
    params: {},
  });
};
export const fetchEmpresas = () =>
  makeHttpRequestEmpresas()
    .then(getResponseDataEmpresas)
    .then(
      (Empresas): Promise<Array<MsDataEmpresas | null>> =>
        Promise.all(Empresas.map(getMaybeValidRecepcionEmpresas))
    )
    .then(Empresas => Empresas.filter(x => x))
    .then(Empresas => Empresas.map(parseEmpresa));

const makeHttpRequestEstados = (): AxiosPromise<MsResponseDataEstados> => {
  //return axios.http.get('api/values/clientes');
  return axios.http.post('Metabase/PostgenericA/busquedas/proxyTrackEmpresas', {
    params: {},
  });
};
export const fetchEstados = () =>
  makeHttpRequestEstados()
    .then(getResponseDataEstados)
    .then(
      (Estado): Promise<Array<MsDataEstados | null>> =>
        Promise.all(Estado.map(getMaybeValidRecepcionEstados))
    )
    .then(Estado => Estado.filter(x => x))
    .then(Estado => Estado.map(parseEstado));

const makeHttpRequestCategorias = (): AxiosPromise<
  MsResponseDataCategorias
> => {
  //return axios.http.get('api/values/clientes');
  return axios.http.post(
    'Metabase/PostgenericA/busquedas/proxyTrackCategorias',
    {
      params: {},
    }
  );
};
export const fetchCategorias = () =>
  makeHttpRequestCategorias()
    .then(getResponseDataCategorias)
    .then(
      (Categoria): Promise<Array<MsDataCategorias | null>> =>
        Promise.all(Categoria.map(getMaybeValidRecepcionCategorias))
    )
    .then(Categoria => Categoria.filter(x => x))
    .then(Categoria => Categoria.map(parseCategoria));

const getResponseDataEmpresas = (
  axiosResponse: AxiosResponse<MsResponseDataEmpresas>
): MsDataEmpresas[] => {
  try {
    const x = axiosResponse.data;
    return x.data != undefined && x.data instanceof Array ? x.data : [];
  } catch {
    return [];
  }
};
const getResponseDataEstados = (
  axiosResponse: AxiosResponse<MsResponseDataEstados>
): MsDataEstados[] => {
  try {
    const x = axiosResponse.data;
    return x.data != undefined && x.data instanceof Array ? x.data : [];
  } catch {
    return [];
  }
};
const getResponseDataCategorias = (
  axiosResponse: AxiosResponse<MsResponseDataCategorias>
): MsDataCategorias[] => {
  try {
    const x = axiosResponse.data;
    return x.data != undefined && x.data instanceof Array ? x.data : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidRecepcionEmpresas = (
  empresa: ConfigEmpresasBackend
): Promise<ConfigEmpresasBackend | null> => {
  return schema
    .isValid(empresa, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? empresa : null));
};
const getMaybeValidRecepcionEstados = (
  Estado: ConfigEstadosBackend
): Promise<ConfigEstadosBackend | null> => {
  return schema
    .isValid(Estado, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? Estado : null));
};
const getMaybeValidRecepcionCategorias = (
  categoria: ConfigCategoriasBackend
): Promise<ConfigCategoriasBackend | null> => {
  /*if ("header" in categoria) {
    return categoria
  }*/
  return schema
    .isValid(categoria, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? categoria : null));
};

const parseEmpresa = (x: ConfigEmpresasBackend): ConfigEmpresas => ({
  id: x.id,
  nombre: x.nombre,
});
const parseEstado = (x: ConfigEstadosBackend): ConfigEstados => ({
  id: x.id,
  nombre: x.nombre,
});
const parseCategoria = (x: ConfigCategoriasBackend): ConfigCategorias => ({
  header: x.header,
  id: x.id,
  nombre: x.nombre,
});

export type ConfigEmpresas = {
  id?: string;
  nombre?: string;
};
export type ConfigEstados = {
  id?: string;
  nombre?: string;
};
export type ConfigCategorias = {
  header?: string;
  id?: string;
  nombre?: string;
};

/*type EstadoBackend = {
  id: number;
  nombre: string;
};

type GiroHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Comercial);

const makeHttpRequest = (): AxiosPromise<GiroHttpResponseBody> => {
  return axios.http.get('Comercial/estadosfactura');
};

const getResponseData = (
  axiosResponse: AxiosResponse<GiroHttpResponseBody>
): EstadoBackend[] => {
  try {
    const maybePautasActividades = axiosResponse.data;
    return maybePautasActividades instanceof Array
      ? maybePautasActividades
      : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidRecepcion = (
  giro: EstadoBackend
): Promise<EstadoBackend | null> => {
  return schema
    .isValid(giro, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? giro : null));
};

const parseGiro = (x: EstadoBackend): TipoEstado => ({
  id: x.id,
  nombre: x.nombre,
});

export type TipoEstado = {
  id?: number;
  nombre?: string;
};

export const fetchTipoEstados = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Giro): Promise<Array<EstadoBackend | null>> =>
        Promise.all(Giro.map(getMaybeValidRecepcion))
    )
    .then(Giro => Giro.filter(x => x))
    .then(Giro => Giro.map(parseGiro));

*/
