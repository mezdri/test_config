import { TipoDispositivoNuevo } from '@/pantallas/TipoDispositivo/TipoDispositivo';
import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type CrearTipoDispositivoHttpResponseBody = unknown;
export type CrearTipoDispositivoHttpRequestParams = {
  nombre: string;
  id: number;
  descripcion?: string;
  marca: string;
  modelo: string;
};

const axios = new AxiosVue(ServicioProxy.Dispositivo);

const makeHttpRequest = (
  tipoDispositivo: TipoDispositivoNuevo
): AxiosPromise<CrearTipoDispositivoHttpResponseBody> => {
  const params: CrearTipoDispositivoHttpRequestParams = {
    ...tipoDispositivo,
    id: 0,
  };
  return axios.http.post('TipoDispositivo', params);
};

export const crearTipoDispositivo = (tipoDispositivo: TipoDispositivoNuevo) =>
  makeHttpRequest(tipoDispositivo);
