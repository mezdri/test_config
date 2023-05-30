import {
  DispositivoNuevo,
  DatoExtendido,
} from '@/pantallas/Dispositivos/Dispositivos';
import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type EditarDispositivoHttpResponseBody = unknown;
export type EditarDispositivoHttpRequestParams = {
  id: number;
  nombre: string;
  descripcion?: string;
  tipoDispositivoId: number;
  icono: string;
  iconoBase64?: string;
  isGps: boolean;
  dispositivoCampoVm?: DatoExtendido[];
};

const axios = new AxiosVue(ServicioProxy.Dispositivo);

const makeHttpRequest = (
  dispositivo: DispositivoNuevo
): AxiosPromise<EditarDispositivoHttpResponseBody> => {
  const params: EditarDispositivoHttpRequestParams = {
    ...dispositivo,
  };
  return axios.http.put('dispositivo', params);
};

export const editarDispositivo = (dispositivo: DispositivoNuevo) =>
  makeHttpRequest(dispositivo);
