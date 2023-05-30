import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { PautaActividad } from '@/pantallas/PautasActividades/PautaActividad';

type DeletePautaActividadHttpResponseBody = unknown;
export type DeletePautaActividadHttpRequestParams = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  pautaActividad: PautaActividad
): AxiosPromise<DeletePautaActividadHttpResponseBody> => {
  const params: DeletePautaActividadHttpRequestParams = {
    id: pautaActividad.id,
  };
  return axios.http.delete('PautaActividad', { params });
};

export const eliminarPautasActividades = (pautaActividad: PautaActividad) =>
  makeHttpRequest(pautaActividad);
