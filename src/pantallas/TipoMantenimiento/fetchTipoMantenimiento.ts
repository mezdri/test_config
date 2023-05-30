import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { TipoMantenimiento } from '@/pantallas/TipoMantenimiento/TipoMantenimiento';
import { EstadoEntidad } from '@/config/enums';

type TipoMantenimientoBackend = {
  id?: number;
  nombre?: string;
  descripcion?: string;
  categoriaTipoMantenimiento?: number;
  categoriaTipoMantenimientoTxt?: string;
  estadoTxt?: string;
  estado?: EstadoEntidad;
  usuarioCreacion?: string;
  fechaCreacion?: moment.Moment;
  usuarioModificacion?: string;
  fechaModificacion?: moment.Moment;
  totalAsociados: number;
};

type GetHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<GetHttpResponseBody> => {
  return axios.http.get('TipoMantenimiento');
};

const getResponseData = (
  axiosResponse: AxiosResponse<GetHttpResponseBody>
): TipoMantenimientoBackend[] => {
  try {
    const maybeTaller = axiosResponse.data;
    return maybeTaller instanceof Array ? maybeTaller : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
  descripcion: string().ensure(),
  categoriaTipoMantenimiento: string().ensure(),
  estado: string().ensure(),
  usuarioCreador: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioModificacion: string().ensure(),
  fechaModificacion: string().ensure(),
  categoriaTipoMantenimientoTxt: string().ensure(),
  estadoTxt: string().ensure(),
  totalAsociados: string().ensure(),
});

const getMaybeValidTipoMantenimiento = (
  tipoMantenimiento: TipoMantenimientoBackend
): Promise<TipoMantenimientoBackend | null> => {
  return schema
    .isValid(tipoMantenimiento, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? tipoMantenimiento : null));
};

const parseTipoMantenimiento = (
  x: TipoMantenimientoBackend
): TipoMantenimiento => ({
  id: x.id,
  nombre: x.nombre,
  categoriaTipoMantenimiento: x.categoriaTipoMantenimiento,
  descripcion: x.descripcion,
  estado: x.estado,
  usuarioCreador: x.usuarioCreacion === null ? '' : x.usuarioCreacion,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioModificacion:
    x.usuarioModificacion === null ? '' : x.usuarioModificacion,
  fechaModificacion: moment(x.fechaModificacion),
  categoriaTipoMantenimientoTxt:
    x.categoriaTipoMantenimientoTxt === null
      ? ''
      : x.categoriaTipoMantenimientoTxt,
  estadoTxt: x.estadoTxt,
  totalAsociados: x.totalAsociados,
});

export const fetchTipoMantenimiento = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (TipoMantenimiento): Promise<Array<TipoMantenimientoBackend | null>> =>
        Promise.all(TipoMantenimiento.map(getMaybeValidTipoMantenimiento))
    )
    .then(TipoMantenimiento => TipoMantenimiento.filter(x => x))
    .then(TipoMantenimiento => TipoMantenimiento.map(parseTipoMantenimiento));
