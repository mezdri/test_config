import { TipoDispositivoNuevo } from '@/pantallas/TipoDispositivo/TipoDispositivo';

import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type EditarTipoDispositivoHttpResponseBody = unknown;
export type EditarTipoDispositivoHttpRequestParams = {
  nombre: string;
  id: number;
  descripcion?: string;
  marca: string;
  modelo: string;
};

const axios = new AxiosVue(ServicioProxy.Dispositivo);

const makeHttpRequest = (
  tipoDispositivo: TipoDispositivoNuevo
): AxiosPromise<EditarTipoDispositivoHttpResponseBody> => {
  const params: EditarTipoDispositivoHttpRequestParams = {
    ...tipoDispositivo,
  };
  return axios.http.put('TipoDispositivo', params);
};

export const editarTipoDispositivo = (tipoDispositivo: TipoDispositivoNuevo) =>
  makeHttpRequest(tipoDispositivo);
