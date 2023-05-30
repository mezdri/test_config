import { array, number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, TiposZonas } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

type BackendData = {
  listasDistribuciones: {
    id: number;
    nombre: string;
  }[];
  contactos: {
    id: number;
    nombre: string;
    email: string;
  }[];
  usuarios: {
    id: number;
    nombre: string;
    email: string;
  }[];
};

type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Notificacion);

const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get(`Notificacion/BuscarListDistrContactosUsuarios`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): BackendData => {
  const emptyResponse: BackendData = {
    listasDistribuciones: [],
    contactos: [],
    usuarios: [],
  };
  try {
    const maybeData =
      axiosResponse.data instanceof Object
        ? { ...emptyResponse, ...axiosResponse.data }
        : emptyResponse;
    return {
      listasDistribuciones:
        maybeData.listasDistribuciones instanceof Array
          ? maybeData.listasDistribuciones
          : [],
      contactos:
        maybeData.contactos instanceof Array ? maybeData.contactos : [],
      usuarios: maybeData.usuarios instanceof Array ? maybeData.usuarios : [],
    };
  } catch {
    return emptyResponse;
  }
};

const schema = object({
  listasDistribuciones: array(
    object({
      id: number(),
      nombre: string().ensure(),
    })
  ),
  contactos: array(
    object({
      id: number(),
      nombre: string().ensure(),
      email: string().ensure(),
    })
  ),
  usuarios: array(
    object({
      id: number(),
      nombre: string().ensure(),
      email: string().ensure(),
    })
  ),
});

const getMaybeValidData = (
  backendData: BackendData
): Promise<BackendData | null> => {
  return schema
    .validate(backendData, {
      strict: false,
      stripUnknown: true,
    })
    .catch(error => {
      console.log(error);
    })
    .then(valid => {
      if (!valid) {
        throw new Error('invalida de acuerdo a esquema');
      }
      return valid ? backendData : null;
    });
};

export type ListaDistribucion = {
  id: number;
  nombre: string;
  tipo: string;
};
export type Contacto = {
  id: number;
  nombre: string;
  tipo: string;
  email: string;
};
export type Usuario = {
  id: number;
  nombre: string;
  tipo: string;
  email: string;
};

export type ListDistrContactosUsuarios = {
  listaDistribucion: ListaDistribucion[];
  contactos: Contacto[];
  usuarios: Usuario[];
};

const parse = (backendData: BackendData): ListDistrContactosUsuarios => {
  return {
    listaDistribucion: backendData.listasDistribuciones.map(x => ({
      id: x.id,
      nombre: x.nombre,
      tipo: 'Lista de Distribución',
    })),
    contactos: backendData.contactos.map(x => ({
      id: x.id,
      nombre: x.nombre,
      tipo: 'Contacto',
      email: x.email,
    })),
    usuarios: backendData.usuarios.map(x => ({
      id: x.id,
      nombre: x.nombre,
      tipo: 'Usuario',
      email: x.email,
    })),
  };
};

export const fetchListDistrContactosUsuarios = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(getMaybeValidData)
    .then(parse)
    .catch(x => {
      // TODO sentry log
      console.error(x);
    });
