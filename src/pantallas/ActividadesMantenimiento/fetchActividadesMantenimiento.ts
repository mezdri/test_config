import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';
import { ActividadMantenimiento } from '@/pantallas/ActividadesMantenimiento/ActividadMantenimiento';

type ActividadMantenimientoBackend = {
  id: number;
  nombreActividad: string;
  descripcion: string;
  activo: number;
  estado: number;
};

type ActividadMantenimientoHttpResponseBody = unknown;
export type FetchActividadMantenimientoHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<
  ActividadMantenimientoHttpResponseBody
> => {
  const body: FetchActividadMantenimientoHttpRequestBody = {
    clienteId: config.getClienteSesion(),
    usuarioId: store.state.userId,
  };
  return axios.http.get('ActividadesMant');
};

const getResponseData = (
  axiosResponse: AxiosResponse<ActividadMantenimientoHttpResponseBody>
): ActividadMantenimientoBackend[] => {
  try {
    const maybeActividadMantenimiento = axiosResponse.data;
    return maybeActividadMantenimiento instanceof Array
      ? maybeActividadMantenimiento
      : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidRecepcion = (
  actividadMantenimiento: ActividadMantenimientoBackend
): Promise<ActividadMantenimientoBackend | null> => {
  return schema
    .isValid(actividadMantenimiento, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? actividadMantenimiento : null));
};

const parseActividadMantenimiento = (
  x: ActividadMantenimientoBackend
): ActividadMantenimiento => ({
  id: x.id,
  nombreActividad: x.nombreActividad,
  descripcion: x.descripcion,
  activo: x.activo,
  estado: x.estado,
});

export const fetchActividadMantenimiento = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (
        ActividadMantenimiento
      ): Promise<Array<ActividadMantenimientoBackend | null>> =>
        Promise.all(ActividadMantenimiento.map(getMaybeValidRecepcion))
    )
    .then(ActividadMantenimiento => ActividadMantenimiento.filter(x => x))
    .then(ActividadMantenimiento =>
      ActividadMantenimiento.map(parseActividadMantenimiento)
    );
