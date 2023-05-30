import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Taller } from '@/pantallas/Taller/Taller';

type EditTallerHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  taller: Taller
): AxiosPromise<EditTallerHttpResponseBody> => {
  return axios.http.put('TallerMant', taller);
};

export const editarTaller = (taller: Taller) => makeHttpRequest(taller);
