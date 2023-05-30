import { object, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

export type ConfigTiposBackend = {
  id: string;
  nombre: string;
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

type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequestTipos = (): AxiosPromise<MsResponseDataTipos> => {
  return axios.http.post('Metabase/PostgenericB/camaras/getTiposAlertas', {
    params: {},
  });
};
export const fetchTiposAlerta = () =>
  makeHttpRequestTipos()
    .then(getResponseDataTipos)
    .then(
      (Tipo): Promise<Array<MsDataTipos | null>> =>
        Promise.all(Tipo.map(getMaybeValidRecepcionTipos))
    )
    .then(Tipo => Tipo.filter(x => x))
    .then(Tipo => Tipo.map(parseTipo));

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

const schema = object({});

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

const parseTipo = (x: ConfigTiposBackend): ConfigTiposAlerta => ({
  id: x.id,
  nombre: x.nombre,
  disabled: false,
});

export type ConfigTiposAlerta = {
  id?: string;
  nombre?: string;
  disabled?: boolean;
};
