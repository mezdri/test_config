import { object, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

type TipoDocumentoBackend = {
  id: number;
  nombre: string;
};

type GiroHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Comercial);

const makeHttpRequest = (): AxiosPromise<GiroHttpResponseBody> => {
  return axios.http.get('Comercial/tipodocumento');
};

const getResponseData = (
  axiosResponse: AxiosResponse<GiroHttpResponseBody>
): TipoDocumentoBackend[] => {
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
  giro: TipoDocumentoBackend
): Promise<TipoDocumentoBackend | null> => {
  return schema
    .isValid(giro, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? giro : null));
};

const parseGiro = (x: TipoDocumentoBackend): TipoDocumento => ({
  id: x.id,
  nombre: x.nombre,
});

export type TipoDocumento = {
  id?: number;
  nombre?: string;
};

export const fetchTipoDocumentos = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Giro): Promise<Array<TipoDocumentoBackend | null>> =>
        Promise.all(Giro.map(getMaybeValidRecepcion))
    )
    .then(Giro => Giro.filter(x => x))
    .then(Giro => Giro.map(parseGiro));
