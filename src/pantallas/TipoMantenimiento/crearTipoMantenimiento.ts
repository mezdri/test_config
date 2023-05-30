import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { TipoMantenimiento } from '@/pantallas/TipoMantenimiento/TipoMantenimiento';

type CreateHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  tipoMantenimiento: TipoMantenimiento
): AxiosPromise<CreateHttpResponseBody> => {
  return axios.http.post('TipoMantenimiento', tipoMantenimiento);
};

export const crearTipoMantenimiento = (tipoMantenimiento: TipoMantenimiento) =>
  makeHttpRequest(tipoMantenimiento);
