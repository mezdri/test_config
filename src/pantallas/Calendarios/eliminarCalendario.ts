import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Calendario } from '@/pantallas/Calendarios/Calendario';
import config from '@/config/index';

type DeleteCalendarioHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Calendario);

const makeHttpRequest = (
  calendario: Calendario
): AxiosPromise<DeleteCalendarioHttpResponseBody> => {
  const clienteId = config.getClienteSesion();
  return axios.http.delete(`Calendario/${calendario.id}`);
};

export const eliminarCalendario = (calendario: Calendario) =>
  makeHttpRequest(calendario);
