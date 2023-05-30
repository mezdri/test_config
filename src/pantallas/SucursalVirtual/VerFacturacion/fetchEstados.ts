import { object, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

type EstadoBackend = {
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
    const x = axiosResponse.data;
    return x instanceof Array ? x : [];
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
