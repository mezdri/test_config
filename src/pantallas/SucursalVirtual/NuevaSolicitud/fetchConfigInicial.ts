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
  idCuenta: string;
  idGrupoCuentas: string;
};
export type ConfigTiposBackend = {
  id: string;
  nombre: string;
};
export type ConfigCategoriasBackend = {
  header: string;
  id: string;
  nombre: string;
};
export type ConfigDireccionBackend = {
  id: string;
  nombre: string;
};

type MsDataEmpresas = {
  id: string;
  nombre: string;
  idGrupoCuentas: string;
  idCuenta: string;
};

type MsDataEstados = {
  id: string;
  text: string;
};

type MsResponseDataEmpresas = {
  codigo_respuesta: string;
  mensaje_respuesta: string;
  data: Array<MsDataEmpresas>;
};

type MsResponseDataEstados = {
  codigo_respuesta: string;
  mensaje_respuesta: string;
  data: Array<MsDataEstados>;
};

type MsDataTipos = {
  id: string;
  nombre: string;
};
type MsResponseDataTipos = {
  codigo_respuesta: string;
  mensaje_respuesta: string;
  data: Array<MsDataTipos>;
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

type MsDataDireccion = {
  id: string;
  nombre: string;
};
type MsResponseDataDireccion = {
  codigo_respuesta: string;
  mensaje_respuesta: string;
  data: Array<MsDataDireccion>;
};

type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequestEmpresas = (): AxiosPromise<MsResponseDataEmpresas> => {
  //return axios.http.get('api/values/clientes');
  return axios.http.post('Metabase/PostgenericA/track/getEmpresasSucursal', {
    user_id: JSON.parse(window.localStorage.user).id.toString(),
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
  return axios.http.post('Metabase/PostgenericA/track/getEstadosSucursal', {
    entidad: 'incident',
    campo: 'statuscode',
  });
};
export const fetchEstados = () =>
  makeHttpRequestEstados().then(response => {
    return response;
  });

const makeHttpRequestTipos = (): AxiosPromise<MsResponseDataTipos> => {
  //return axios.http.get('api/values/clientes');
  return axios.http.post('Metabase/PostgenericA/track/getTipoCasoSucursal', {
    params: {},
  });
};
export const fetchTipos = () =>
  makeHttpRequestTipos()
    .then(getResponseDataTipos)
    .then(
      (Tipo): Promise<Array<MsDataTipos | null>> =>
        Promise.all(Tipo.map(getMaybeValidRecepcionTipos))
    )
    .then(Tipo => Tipo.filter(x => x))
    .then(Tipo => Tipo.map(parseTipo));

const makeHttpRequestCategorias = (): AxiosPromise<
  MsResponseDataCategorias
> => {
  //return axios.http.get('api/values/clientes');
  return axios.http.post('Metabase/PostgenericA/track/getCategoriasSucursal', {
    params: {},
  });
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

const makeHttpRequestDireccion = (
  rutEmpresa: string
): AxiosPromise<MsResponseDataCategorias> => {
  return axios.http.post('Metabase/PostgenericA/track/getDireccionesSucursal', {
    rutEmpresa: rutEmpresa,
    user_id: JSON.parse(window.localStorage.user).id.toString(),
  });
};
export const fetchDirecciones = (rutEmpresa: string) =>
  makeHttpRequestDireccion(rutEmpresa)
    .then(getResponseDataDireccion)
    .then(
      (Direccion): Promise<Array<MsDataDireccion | null>> =>
        Promise.all(Direccion.map(getMaybeValidRecepcionDireccion))
    )
    .then(Direccion => Direccion.filter(x => x))
    .then(Direccion => Direccion.map(parseDireccion));

const makeHttpRequestRegiones = (): AxiosPromise<MsResponseDataCategorias> => {
  return axios.http.post('Metabase/PostgenericA/track/getRegionesSucursal', {});
};
export const fetchRegiones = () =>
  makeHttpRequestRegiones()
    .then(getResponseDataDireccion)
    .then(
      (Direccion): Promise<Array<MsDataDireccion | null>> =>
        Promise.all(Direccion.map(getMaybeValidRecepcionDireccion))
    )
    .then(Direccion => Direccion.filter(x => x))
    .then(Direccion => Direccion.map(parseDireccion));

const makeHttpRequestComunas = (
  region: string
): AxiosPromise<MsResponseDataCategorias> => {
  return axios.http.post('Metabase/PostgenericA/track/getComunasSucursal', {
    region: region,
  });
};
export const fetchComunas = (region: string) =>
  makeHttpRequestComunas(region)
    .then(getResponseDataDireccion)
    .then(
      (Direccion): Promise<Array<MsDataDireccion | null>> =>
        Promise.all(Direccion.map(getMaybeValidRecepcionDireccion))
    )
    .then(Direccion => Direccion.filter(x => x))
    .then(Direccion => Direccion.map(parseDireccion));

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
const getResponseDataTipos = (
  axiosResponse: AxiosResponse<MsResponseDataTipos>
): MsDataTipos[] => {
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
const getResponseDataDireccion = (
  axiosResponse: AxiosResponse<MsResponseDataDireccion>
): MsDataDireccion[] => {
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
const getMaybeValidRecepcionTipos = (
  tipo: ConfigTiposBackend
): Promise<ConfigTiposBackend | null> => {
  return schema
    .isValid(tipo, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? tipo : null));
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
const getMaybeValidRecepcionDireccion = (
  direccion: ConfigDireccionBackend
): Promise<ConfigDireccionBackend | null> => {
  return schema
    .isValid(direccion, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? direccion : null));
};

const parseEmpresa = (x: ConfigEmpresasBackend): ConfigEmpresas => ({
  id: x.id,
  nombre: x.nombre,
  idCuenta: x.idCuenta,
  idGrupoCuentas: x.idGrupoCuentas,
});
const parseTipo = (x: ConfigTiposBackend): ConfigTipos => ({
  id: x.id,
  nombre: x.nombre,
});
const parseCategoria = (x: ConfigCategoriasBackend): ConfigCategorias => ({
  header: x.header,
  id: x.id,
  nombre: x.nombre,
});
const parseDireccion = (x: ConfigDireccionBackend): ConfigDireccion => ({
  id: x.id,
  nombre: x.nombre,
});

export type ConfigEmpresas = {
  id?: string;
  nombre?: string;
  idCuenta?: string;
  idGrupoCuentas?: string;
};
export type ConfigEstados = {
  id?: string;
  text?: string;
};
export type ConfigTipos = {
  id?: string;
  nombre?: string;
};
export type ConfigCategorias = {
  header?: string;
  id?: string;
  nombre?: string;
};
export type ConfigDireccion = {
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
