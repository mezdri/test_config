import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type DeleteHttpResponseBody = unknown;
export type DeleteHttpRequestParams = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (id: number): AxiosPromise<DeleteHttpResponseBody> => {
  const params: DeleteHttpRequestParams = {
    id: id,
  };
  return axios.http.delete('Calibracion', { params });
};

export const eliminarCalibracion = (id: number) => makeHttpRequest(id);
