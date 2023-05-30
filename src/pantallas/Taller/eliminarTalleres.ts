import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Taller } from '@/pantallas/Taller/Taller';

type DeleteTallerHttpResponseBody = unknown;
export type DeleteTallerHttpRequestParams = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  taller: Taller
): AxiosPromise<DeleteTallerHttpResponseBody> => {
  const params: DeleteTallerHttpRequestParams = {
    id: taller.id,
  };
  return axios.http.delete('TallerMant', { params });
};

export const eliminarTalleres = (taller: Taller) => makeHttpRequest(taller);
