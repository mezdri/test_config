import { object, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';
import { Giro } from '@/reusable/Giro/Giro';

type GiroBackend = {
  id: number;
  nombre: string;
  estado: number[];
  usuarioCreadorId: number;
  fechaCreacion: moment.Moment;
  usuarioModificacionId: number;
  fechaModificacion: string;
};

type GiroHttpResponseBody = unknown;
export type FetchGiroHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
};

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (): AxiosPromise<GiroHttpResponseBody> => {
  const body: FetchGiroHttpRequestBody = {
    clienteId: config.getClienteSesion(),
    usuarioId: store.state.userId,
  };
  return axios.http.get('Giro/grid2');
};

const getResponseData = (
  axiosResponse: AxiosResponse<GiroHttpResponseBody>
): GiroBackend[] => {
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
  giro: GiroBackend
): Promise<GiroBackend | null> => {
  return schema
    .isValid(giro, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? giro : null));
};

const parseGiro = (x: GiroBackend): Giro => ({
  id: x.id,
  nombre: x.nombre,
  estado: [0, 1, 2, 3, 4, 5],
  usuarioCreadorId: x.usuarioCreadorId,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioModificacionId: x.usuarioModificacionId,
  fechaModificacion: x.fechaModificacion,
});

export const fetchGiro = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Giro): Promise<Array<GiroBackend | null>> =>
        Promise.all(Giro.map(getMaybeValidRecepcion))
    )
    .then(Giro => Giro.filter(x => x))
    .then(Giro => Giro.map(parseGiro));
