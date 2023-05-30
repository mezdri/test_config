import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { TipoDispositivo } from '@/pantallas/TipoDispositivo/TipoDispositivo';

type TipoDispositivoBackend = {
  id: number;
  nombre: string;
  descripcion?: string;
  marca: string;
  modelo: string;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
  totalAsociados: number;
};

type TipoDispositivoHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Dispositivo);

const makeHttpRequest = (): AxiosPromise<TipoDispositivoHttpResponseBody> => {
  return axios.http.get(`TipoDispositivo/grid2/`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<TipoDispositivoHttpResponseBody>
): TipoDispositivoBackend[] => {
  try {
    const maybeTipoDispositivo = axiosResponse.data;
    return maybeTipoDispositivo instanceof Array ? maybeTipoDispositivo : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
  descripcion: string().ensure(),
  marca: string().ensure(),
  modelo: string().ensure(),
  fechaModificacion: string().ensure(),
  usuarioModifica: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioCreador: string().ensure(),
  totalAsociados: string().ensure(),
});

const getMaybeValidTipo = (
  tipoDispostivo: TipoDispositivoBackend
): Promise<TipoDispositivoBackend | null> => {
  return schema
    .isValid(tipoDispostivo, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? tipoDispostivo : null));
};

const parseTipoDispositivo = (x: TipoDispositivoBackend): TipoDispositivo => ({
  id: x.id,
  nombre: x.nombre,
  descripcion: x.descripcion,
  marca: x.marca,
  modelo: x.modelo,
  fechaModificacion: moment(x.fechaModificacion),
  usuarioModifica: x.usuarioModifica === null ? '' : x.usuarioModifica,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioCreador: x.usuarioCreador,
  totalAsociados: x.totalAsociados,
});

export const fetchTiposDispositivo = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (TipoDispositivo): Promise<Array<TipoDispositivoBackend | null>> =>
        Promise.all(TipoDispositivo.map(getMaybeValidTipo))
    )
    .then(TipoDispositivo => TipoDispositivo.filter(x => x))
    .then(TipoDispositivo => TipoDispositivo.map(parseTipoDispositivo));
