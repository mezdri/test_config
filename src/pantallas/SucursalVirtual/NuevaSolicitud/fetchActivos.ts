import { object, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

/*
{
"IDActivo":"12bc8f0f-d586-e811-8101-00155d6b1004",
"Patente":"5161065414",
"IDTipoVehiculo":"",
"TipoVehiculo":"",
"Marca":null,
"Modelo":null,
"Anno":null,
"Estado":"Activo",
"IDEstado":"1"
}
*/

export type ConfigActivosBackend = {
  id: string;
  patente: string;
  idTipoVehiculo: string;
  tipoVehiculo: string;
  marca: string;
  modelo: string;
  anno: string;
  estado: string;
  idEstado: string;
};

type MsResponseData = {
  codigo_respuesta: string;
  mensaje_respuesta: string;
  data: string[];
};

type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequestActivos = (
  rutEmpresa: string
): AxiosPromise<MsResponseData> => {
  let params: params = {
    request: {
      RutEmpresa: rutEmpresa,
    },
  };
  return axios.http.post('Metabase/PostgenericA/busquedas/proxyTrackActivos', {
    params: params.request,
  });
};
export type params = {
  request: request;
};
export type request = {
  RutEmpresa?: string;
};

export const fetchActivos = (rutEmpresa: string) =>
  makeHttpRequestActivos(rutEmpresa).then(getResponseDataActivos);
/*.then(
      (Activos): Promise<Array<ConfigActivosBackend | null>> =>
        Promise.all(Activos.map(getMaybeValidRecepcionActivos))
    )
    .then(Activos => Activos.filter(x => x))
    .then(Activos => Activos.map(parseActivo));*/

const getResponseDataActivos = (
  axiosResponse: AxiosResponse<MsResponseData>
): string[] => {
  try {
    const x = axiosResponse.data;
    return x.data != undefined && x.data instanceof Array ? x.data : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidRecepcionActivos = (
  activos: ConfigActivosBackend
): Promise<ConfigActivosBackend | null> => {
  return schema
    .isValid(activos, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? activos : null));
};

const parseActivo = (x: ConfigActivosBackend): Activos => ({
  id: x.id,
  patente: x.patente,
  idTipoVehiculo: x.idTipoVehiculo,
  tipoVehiculo: x.tipoVehiculo,
  marca: x.marca,
  modelo: x.modelo,
  anno: x.anno,
  estado: x.estado,
  idEstado: x.idEstado,
});

export type Activos = {
  id?: string;
  patente?: string;
  idTipoVehiculo?: string;
  tipoVehiculo?: string;
  marca?: string;
  modelo?: string;
  anno?: string;
  estado?: string;
  idEstado?: string;
};

export type ActivosAuto = {
  id: string;
  name: string;
  description: string;
};
