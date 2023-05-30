import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { TipoMantenimiento } from '@/pantallas/TipoMantenimiento/TipoMantenimiento';

type EditHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  tipoMantenimiento: TipoMantenimiento
): AxiosPromise<EditHttpResponseBody> => {
  return axios.http.put('TipoMantenimiento', tipoMantenimiento);
};

export const editarTipoMantenimiento = (tipoMantenimiento: TipoMantenimiento) =>
  makeHttpRequest(tipoMantenimiento);
