import { array, number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

type BackendData = {
  etiquetas: {
    id: number;
    nombre: string;
  }[];
  flotas: {
    id: number;
    nombre: string;
    padre: number;
    nombrePadre: string;
  }[];
  vehiculos: {
    id: number;
    unidad: string;
    etiquetas: number[];
    flota: number;
    flotaNombre: string;
    tipoVehiculo: string;
    marca: string;
    modelo: string;
    tipoCombustible: string;
    tipoTransmision: string;
    ano: string;
    poseeGps: boolean;
  }[];
};

type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Reporte);

const makeHttpRequest = (
  clienteId: number,
  usuarioId: number
): AxiosPromise<HttpResponseBody> => {
  return axios.http.get(`Reporte/${usuarioId}/${clienteId}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): BackendData => {
  const emptyResponse: BackendData = {
    etiquetas: [],
    flotas: [],
    vehiculos: [],
  };
  try {
    const maybeData =
      axiosResponse.data instanceof Object
        ? { ...emptyResponse, ...axiosResponse.data }
        : emptyResponse;
    return {
      etiquetas:
        maybeData.etiquetas instanceof Array ? maybeData.etiquetas : [],
      flotas: maybeData.flotas instanceof Array ? maybeData.flotas : [],
      vehiculos:
        maybeData.vehiculos instanceof Array ? maybeData.vehiculos : [],
    };
  } catch {
    return emptyResponse;
  }
};

const schema = object({
  etiquetas: array(
    object({
      id: number(),
      nombre: string().ensure(),
    })
  ),
  flotas: array(
    object({
      id: number(),
      nombre: string().ensure(),
    })
  ),
  vehiculos: array(
    object({
      id: number(),
      unidad: string().ensure(),
      etiquetas: array(number()),
      flota: number(),
      flotaNombre: string().ensure(),
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

export type Etiqueta = {
  id: number;
  nombre: string;
};
export type Flota = {
  id: number;
  nombre: string;
};
export type Vehiculo = {
  id: number;
  unidad: string;
  flota: Flota;
  etiquetas: Etiqueta[];
  tipoVehiculo?: string;
  marca?: string;
  modelo?: string;
  tipoCombustible?: string;
  tipoTransmision?: string;
  ano?: string;
  poseeGps?: boolean;
};

export type FlotasEtiquetasVehiculos = {
  etiquetas: Etiqueta[];
  flotas: Flota[];
  vehiculos: Vehiculo[];
};

const parse = (backendData: BackendData): FlotasEtiquetasVehiculos => {
  const etiquetas = backendData.etiquetas.map(x => ({
    id: x.id,
    nombre: x.nombre,
  }));
  return {
    etiquetas,
    flotas: backendData.flotas.map(x => ({
      id: x.id,
      nombre: x.nombre,
    })),
    vehiculos: backendData.vehiculos.map(x => ({
      id: x.id,
      unidad: x.unidad,
      flota: {
        id: x.flota,
        nombre: x.flotaNombre,
      },
      etiquetas: x.etiquetas.map(id => {
        const etiqueta = etiquetas.find(x => x.id === id);
        return {
          id,
          nombre: etiqueta ? etiqueta.nombre : '',
        };
      }),
      tipoVehiculo: x.tipoVehiculo,
      marca: x.marca,
      modelo: x.modelo,
      tipoCombustible: x.tipoCombustible,
      tipoTransmision: x.tipoTransmision,
      ano: x.ano,
      poseeGps: x.poseeGps,
    })),
  };
};

export const fetchFlotasEtiquetasVehiculos = () =>
  makeHttpRequest(config.getClienteSesion(), store.state.userId)
    .then(getResponseData)
    .then(getMaybeValidData)
    .then(parse)
    .catch(x => {
      // TODO sentry log
      console.error(x);
    });
