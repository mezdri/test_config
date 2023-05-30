import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { TipoMantenimiento } from '@/pantallas/TipoMantenimiento/TipoMantenimiento';

type DeleteHttpResponseBody = unknown;
export type DeleteHttpRequestParams = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  tipoMantenimiento: TipoMantenimiento
): AxiosPromise<DeleteHttpResponseBody> => {
  const params: DeleteHttpRequestParams = {
    id: tipoMantenimiento.id,
  };
  return axios.http.delete('TipoMantenimiento', { params });
};

export const eliminarTipoMantenimiento = (
  tipoMantenimiento: TipoMantenimiento
) => makeHttpRequest(tipoMantenimiento);
