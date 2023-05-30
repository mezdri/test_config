import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type BackendData = {
  vehiculos: {
    id: number;
    unidad: string;
    flota?: number;
    etiquetas?: number;
    tipoVehiculo?: string;
    marca?: string;
    modelo?: string;
    tipoCombustible?: string;
    tipoTransmision?: string;
    ano?: string;
    poseeGps?: boolean;
  }[];
};
export type Vehiculo = {
  id?: number;
  unidad?: string;
  flota?: number;
  etiquetas?: number;
  tipoVehiculo?: string;
  marca?: string;
  modelo?: string;
  tipoCombustible?: string;
  tipoTransmision?: string;
  ano?: string;
  poseeGps?: boolean;
};

export type VehiculosDDR = {
  vehiculos: Vehiculo[];
};

type GetHttpResponseBody = unknown;
type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Vehiculo);

const makeHttpRequest = (): AxiosPromise<GetHttpResponseBody> => {
  return axios.http.get('vehiculo/getVehiculosDejadosDeRecibirV2');
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): any => {
  const emptyResponse: BackendData = {
    vehiculos: [],
  };
  try {
    const maybeData =
      axiosResponse.data instanceof Object
        ? { ...emptyResponse, ...axiosResponse.data }
        : emptyResponse;
    return {
      vehiculos:
        maybeData.vehiculos instanceof Array ? maybeData.vehiculos : [],
    };
  } catch {
    return emptyResponse;
  }
};

const schema = object({
  id: string().ensure(),
  unidad: string().ensure(),
});

const getMaybeValidData = (
  vehDDR: BackendData
): Promise<BackendData | null> => {
  return schema
    .isValid(vehDDR, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? vehDDR : null));
};

const parse = (backendData: BackendData): VehiculosDDR => {
  return {
    vehiculos: backendData.vehiculos.map(x => ({
      id: x.id,
      unidad: x.unidad,
      flota: x.flota,
      etiquetas: x.etiquetas,
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

export const fetchVehiculosDDR = () =>
  makeHttpRequest()
    .then(getResponseData)
    .catch(x => {
      // TODO sentry log
      console.error(x);
    });
