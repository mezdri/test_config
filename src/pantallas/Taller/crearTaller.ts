import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Taller } from '@/pantallas/Taller/Taller';

type CreateTallerHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  taller: Taller
): AxiosPromise<CreateTallerHttpResponseBody> => {
  return axios.http.post('TallerMant', taller);
};

export const crearTaller = (taller: Taller) => makeHttpRequest(taller);
