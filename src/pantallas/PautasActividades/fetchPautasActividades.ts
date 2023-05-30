import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';
import { PautaActividad } from '@/pantallas/PautasActividades/PautaActividad';

type PautaActividadBackend = {
  id: number;
  nombrePauta: string;
  descripcion: string;
  fechaModificacion: moment.Moment;
  usuarioModificacion: string;
  fechaCreacion: moment.Moment;
  usuarioCreacion: string;
  estadoTxt: string;
  estado: number;
  tipoActividad: number;
};

type PautasActividadesHttpResponseBody = unknown;
export type FetchPautasActividadesHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<PautasActividadesHttpResponseBody> => {
  const body: FetchPautasActividadesHttpRequestBody = {
    clienteId: config.getClienteSesion(),
    usuarioId: store.state.userId,
  };
  return axios.http.get('PautaActividad');
};

const getResponseData = (
  axiosResponse: AxiosResponse<PautasActividadesHttpResponseBody>
): PautaActividadBackend[] => {
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
  pautaActividad: PautaActividadBackend
): Promise<PautaActividadBackend | null> => {
  return schema
    .isValid(pautaActividad, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? pautaActividad : null));
};

const parsePautaActividad = (x: PautaActividadBackend): PautaActividad => ({
  id: x.id,
  nombrePauta: x.nombrePauta,
  fechaModificacion: moment(x.fechaModificacion),
  usuarioModificacion:
    x.usuarioModificacion === null ? '' : x.usuarioModificacion,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioCreacion: x.usuarioCreacion === null ? '' : x.usuarioCreacion,
  descripcion: x.descripcion === null ? '' : x.descripcion,
  estado: x.estado === 1,
  estadoTxt: x.estadoTxt,
  tipoActividad: x.tipoActividad,
});

export const fetchPautasActividades = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (PautasActividades): Promise<Array<PautaActividadBackend | null>> =>
        Promise.all(PautasActividades.map(getMaybeValidRecepcion))
    )
    .then(PautasActividades => PautasActividades.filter(x => x))
    .then(PautasActividades => PautasActividades.map(parsePautaActividad));
