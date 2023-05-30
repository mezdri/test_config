import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { DescargaActividadGrid } from '@/pantallas/DescargaActividades/DescargaActividad';

type DeleteDescargaHttpResponseBody = unknown;
type DeleteDescargaHttpRequestBody = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  descarga: DescargaActividadGrid
): AxiosPromise<DeleteDescargaHttpResponseBody> => {
  return axios.http.delete('integracion/descarga/' + descarga.id);
};

export const eliminarDescargaActividad = (descarga: DescargaActividadGrid) =>
  makeHttpRequest(descarga);
