import { object, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

export type ConfigFlotasBackend = {
  id: string;
  nombre: string;
};

type MsDataFlotas = {
  id: string;
  nombre: string;
};
type MsResponseDataFlotas = {
  codigo_respuesta: string;
  mensaje_respuesta: string;
  data: Array<MsDataFlotas>;
};

type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequestTipos = (): AxiosPromise<MsResponseDataFlotas> => {
  return axios.http.post('Metabase/PostgenericB/camaras/getFlotas', {
    params: { clienteDefecto: window.localStorage.clienteDefecto },
  });
};
export const fetchFlotas = () =>
  makeHttpRequestTipos()
    .then(getResponseDataFlota)
    .then(
      (Flota): Promise<Array<MsDataFlotas | null>> =>
        Promise.all(Flota.map(getMaybeValidRecepcionFlotas))
    )
    .then(Flota => Flota.filter(x => x))
    .then(Flota => Flota.map(parseFlota));

const getResponseDataFlota = (
  axiosResponse: AxiosResponse<MsResponseDataFlotas>
): MsDataFlotas[] => {
  try {
    const x = axiosResponse.data;
    return x.data != undefined && x.data instanceof Array ? x.data : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidRecepcionFlotas = (
  tipo: ConfigFlotasBackend
): Promise<ConfigFlotasBackend | null> => {
  return schema
    .isValid(tipo, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? tipo : null));
};

const parseFlota = (x: ConfigFlotasBackend): ConfigFlotas => ({
  id: x.id,
  nombre: x.nombre,
});

export type ConfigFlotas = {
  id?: string;
  nombre?: string;
};

//Grupos
export type ConfigGrupos = {
  id?: string;
  nombre?: string;
};

const parseGrupos = (x: ConfigFlotasBackend): ConfigGrupos => ({
  id: x.id,
  nombre: x.nombre,
});

const makeHttpRequestGrupos = (
  flota: string
): AxiosPromise<MsResponseDataFlotas> => {
  return axios.http.post('Metabase/PostgenericB/camaras/getGrupos', {
    params: {
      clienteDefecto: window.localStorage.clienteDefecto,
      flota: flota,
    },
  });
};
export const fetchGrupos = (flota: string) =>
  makeHttpRequestGrupos(flota)
    .then(getResponseDataFlota)
    .then(
      (Flota): Promise<Array<MsDataFlotas | null>> =>
        Promise.all(Flota.map(getMaybeValidRecepcionFlotas))
    )
    .then(Flota => Flota.filter(x => x))
    .then(Flota => Flota.map(parseGrupos));
