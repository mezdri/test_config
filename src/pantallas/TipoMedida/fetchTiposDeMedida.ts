import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { TipoMedida } from '@/pantallas/TipoMedida/TipoMedida';

type TipoMedidaBackend = {
  id: number;
  sigla: string;
  nombre: string;
  descripcion?: string;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
  totalAsociados: number;
};

type TipoMedidaHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Dispositivo);

const makeHttpRequest = (): AxiosPromise<TipoMedidaHttpResponseBody> => {
  return axios.http.get(`tipomedida/grid2`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<TipoMedidaHttpResponseBody>
): TipoMedidaBackend[] => {
  try {
    const maybeTipoMedida = axiosResponse.data;
    return maybeTipoMedida instanceof Array ? maybeTipoMedida : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  sigla: string().ensure(),
  nombre: string().ensure(),
  descripcion: string().ensure(),
  fechaModificacion: string().ensure(),
  usuarioModifica: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioCreador: string().ensure(),
  totalAsociados: string().ensure(),
});

const getMaybeValidTipo = (
  tipoMedida: TipoMedidaBackend
): Promise<TipoMedidaBackend | null> => {
  return schema
    .isValid(tipoMedida, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? tipoMedida : null));
};

const parseTipoMedida = (x: TipoMedidaBackend): TipoMedida => ({
  id: x.id,
  sigla: x.sigla,
  nombre: x.nombre,
  descripcion: x.descripcion,
  fechaModificacion: moment(x.fechaModificacion),
  usuarioModifica: x.usuarioModifica === null ? '' : x.usuarioModifica,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioCreador: x.usuarioCreador,
  totalAsociados: x.totalAsociados,
});

export const fetchTiposMedida = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (TipoMedida): Promise<Array<TipoMedidaBackend | null>> =>
        Promise.all(TipoMedida.map(getMaybeValidTipo))
    )
    .then(TipoMedida => TipoMedida.filter(x => x))
    .then(TipoMedida => TipoMedida.map(parseTipoMedida));
