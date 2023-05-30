import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import { ZonaRow } from '@/interfaces/Alertas';

type ZonaBackend = {
  id: number;
  nombre: string;
  tipoZonaId: number;
  tipoZonaNombre: string;
  clienteId: number;
};

type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Gps);

const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('Coordenada');
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): ZonaBackend[] => {
  try {
    const zonas = axiosResponse.data;
    return zonas instanceof Array
      ? zonas.filter(c => c.clienteId == config.getClienteSesion())
      : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
});

const getMaybeValid = (zona: ZonaBackend): Promise<ZonaBackend | null> => {
  return schema
    .isValid(zona, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? zona : null));
};

const parseZona = (x: ZonaBackend): ZonaRow => ({
  id: x.id,
  nombre: x.nombre,
  tipoZonaId: x.tipoZonaId,
  tipoZonaNombre: x.tipoZonaNombre,
});

export const fetchZonas = (): Promise<ZonaRow[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (z): Promise<Array<ZonaBackend | null>> =>
        Promise.all(z.map(getMaybeValid))
    )
    .then(z => z.filter(x => x))
    .then(z => z.map(parseZona));
