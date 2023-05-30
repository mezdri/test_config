import {
  DispositivoNuevo,
  DatoExtendido,
} from '@/pantallas/Dispositivos/Dispositivos';
import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type CrearDispositivoHttpResponseBody = unknown;
export type CrearDispositivoHttpRequestParams = {
  id: number;
  nombre: string;
  descripcion?: string;
  tipoDispositivoId: number;
  icono: string;
  iconoBase64?: string;
  isGps: boolean;
  estado: number;
  dispositivoCampoVm?: DatoExtendido[];
};

const axios = new AxiosVue(ServicioProxy.Dispositivo);

const makeHttpRequest = (
  dispositivo: DispositivoNuevo
): AxiosPromise<CrearDispositivoHttpResponseBody> => {
  const params: CrearDispositivoHttpRequestParams = {
    ...dispositivo,
  };
  return axios.http.post('dispositivo', params);
};

export const crearDispositivo = (dispositivo: DispositivoNuevo) =>
  makeHttpRequest(dispositivo);
