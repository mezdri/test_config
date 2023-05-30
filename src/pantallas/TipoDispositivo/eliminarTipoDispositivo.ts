import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { TipoDispositivo } from '@/pantallas/TipoDispositivo/TipoDispositivo';
import config from '@/config/index';

type DeleteTipoDispositivoHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Dispositivo);

const makeHttpRequest = (
  tipoDispositivo: TipoDispositivo
): AxiosPromise<DeleteTipoDispositivoHttpResponseBody> => {
  return axios.http.delete(`TipoDispositivo/${tipoDispositivo.id}`);
};

export const eliminarTipoDispositivo = (tipoDispositivo: TipoDispositivo) =>
  makeHttpRequest(tipoDispositivo);
