import { TipoMedidaNuevo } from '@/pantallas/TipoMedida/TipoMedida';

import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type EditarTipoMedidaHttpResponseBody = unknown;
export type EditarTipoMedidaHttpRequestParams = {
  id: number;
  sigla: string;
  nombre: string;
  descripcion?: string;
};

const axios = new AxiosVue(ServicioProxy.Dispositivo);

const makeHttpRequest = (
  tipoMedida: TipoMedidaNuevo
): AxiosPromise<EditarTipoMedidaHttpResponseBody> => {
  const params: EditarTipoMedidaHttpRequestParams = {
    ...tipoMedida,
  };
  return axios.http.put('TipoMedida', params);
};

export const editarTipoMedida = (tipoMedida: TipoMedidaNuevo) =>
  makeHttpRequest(tipoMedida);
