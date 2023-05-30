import { TipoMedidaNuevo } from '@/pantallas/TipoMedida/TipoMedida';
import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type CrearTipoMedidaHttpResponseBody = unknown;
export type CrearTipoMedidaHttpRequestParams = {
  id: number;
  sigla: string;
  nombre: string;
  descripcion?: string;
};

const axios = new AxiosVue(ServicioProxy.Dispositivo);

const makeHttpRequest = (
  tipoMedida: TipoMedidaNuevo
): AxiosPromise<CrearTipoMedidaHttpResponseBody> => {
  const params: CrearTipoMedidaHttpRequestParams = {
    ...tipoMedida,
    id: 0,
  };
  return axios.http.post('TipoMedida', params);
};

export const crearTipoMedida = (tipoMedida: TipoMedidaNuevo) =>
  makeHttpRequest(tipoMedida);
