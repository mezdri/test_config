import { object, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

export type ConfigPatentesBackend = {
  id: string;
  nombre: string;
};

type MsDataPatentes = {
  id: string;
  nombre: string;
};
type MsResponseDataPatentes = {
  codigo_respuesta: string;
  mensaje_respuesta: string;
  data: Array<MsDataPatentes>;
};

type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequestTipos = (
  flota: string,
  grupo: string,
  id_user: string
): AxiosPromise<MsResponseDataPatentes> => {
  return axios.http.post('Metabase/PostgenericB/camaras/getPatentes', {
    params: {
      clienteDefecto: window.localStorage.clienteDefecto,
      flota: flota,
      grupo: grupo,
      app: 'vigilanti',
      id_usuario: id_user,
    },
  });
};
export const fetchPatentes = (flota: string, grupo: string, id_user: string) =>
  makeHttpRequestTipos(flota, grupo, id_user)
    .then(getResponseDataPatente)
    .then(
      (Patente): Promise<Array<MsDataPatentes | null>> =>
        Promise.all(Patente.map(getMaybeValidRecepcionPatentes))
    )
    .then(Patente => Patente.filter(x => x))
    .then(Patente => Patente.map(parsePatente));

const getResponseDataPatente = (
  axiosResponse: AxiosResponse<MsResponseDataPatentes>
): MsDataPatentes[] => {
  try {
    const x = axiosResponse.data;
    return x.data != undefined && x.data instanceof Array ? x.data : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidRecepcionPatentes = (
  tipo: ConfigPatentesBackend
): Promise<ConfigPatentesBackend | null> => {
  return schema
    .isValid(tipo, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? tipo : null));
};

const parsePatente = (x: ConfigPatentesBackend): ConfigPatente => ({
  id: x.id,
  nombre: x.nombre,
});

export type ConfigPatente = {
  id?: string;
  nombre?: string;
};
