import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { RecepcionActividad } from '@/pantallas/Recepcion/RecepcionActividad';

type DeleteRecepcionHttpResponseBody = unknown;
type DeleteRecepcionHttpRequestBody = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  recepcion: RecepcionActividad
): AxiosPromise<DeleteRecepcionHttpResponseBody> => {
  const data: DeleteRecepcionHttpRequestBody = {
    id: recepcion.id,
  };
  return axios.http.delete('integracion/recepciones', { params: data });
};

export const eliminarRecepcionActividad = (recepcion: RecepcionActividad) =>
  makeHttpRequest(recepcion);
