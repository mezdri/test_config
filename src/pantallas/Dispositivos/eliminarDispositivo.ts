import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Dispositivo } from '@/reusable/Dispositivos/dispositivos';

type DeleteDispositivoHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Dispositivo);

const makeHttpRequest = (
  dispositivo: Dispositivo
): AxiosPromise<DeleteDispositivoHttpResponseBody> => {
  return axios.http.delete(`Dispositivo/${dispositivo.id}`);
};

export const eliminarDispositivo = (dispositivo: Dispositivo) =>
  makeHttpRequest(dispositivo);
