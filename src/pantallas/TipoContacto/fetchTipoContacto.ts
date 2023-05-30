import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { TipoContacto } from '@/pantallas/TipoContacto/TipoContacto';

type TipoContactoBackend = {
  id: number;
  nombre: string;
  descripcion: string;
  usuarioCreador: string;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  fechaModificacion: moment.Moment;
  estadoTxt: string;
  estado: number;
};

type TipoContactoHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Contacto);

const makeHttpRequest = (): AxiosPromise<TipoContactoHttpResponseBody> => {
  return axios.http.get('TipoContactos/grid2');
};

const getResponseData = (
  axiosResponse: AxiosResponse<TipoContactoHttpResponseBody>
): TipoContactoBackend[] => {
  try {
    const maybeTipoContacto = axiosResponse.data;
    return maybeTipoContacto instanceof Array ? maybeTipoContacto : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
  descripcion: string().ensure(),
  usuarioCreador: string().ensure(),
  usuarioModifica: string().ensure(),
  fechaCreacion: string().ensure(),
  fechaModificacion: string().ensure(),
  estadoTxt: string().ensure(),
  estado: string().ensure(),
});

const getMaybeValidTipoContacto = (
  TipoContacto: TipoContactoBackend
): Promise<TipoContactoBackend | null> => {
  return schema
    .isValid(TipoContacto, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? TipoContacto : null));
};

const parseTipoContacto = (x: TipoContactoBackend): TipoContacto => ({
  id: x.id,
  nombre: x.nombre,
  descripcion: x.descripcion,
  usuarioCreador: x.usuarioCreador,
  usuarioModifica: x.usuarioModifica === null ? '' : x.usuarioModifica,
  fechaCreacion: moment(x.fechaCreacion),
  fechaModificacion: moment(x.fechaModificacion),
  estadoTxt: x.estadoTxt,
  estado: x.estado,
});

export const fetchTipoContacto = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (TiposContacto): Promise<Array<TipoContactoBackend | null>> =>
        Promise.all(TiposContacto.map(getMaybeValidTipoContacto))
    )
    .then(TiposContacto => TiposContacto.filter(x => x))
    .then(TiposContacto => TiposContacto.map(parseTipoContacto));
