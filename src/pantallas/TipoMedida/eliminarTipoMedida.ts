import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { TipoMedida } from '@/pantallas/TipoMedida/TipoMedida';

type DeleteTipoMedidaHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Dispositivo);

const makeHttpRequest = (
  tipoMedida: TipoMedida
): AxiosPromise<DeleteTipoMedidaHttpResponseBody> => {
  return axios.http.delete(`TipoMedida/${tipoMedida.id}`);
};

export const eliminarTipoMedida = (tipoMedida: TipoMedida) =>
  makeHttpRequest(tipoMedida);
