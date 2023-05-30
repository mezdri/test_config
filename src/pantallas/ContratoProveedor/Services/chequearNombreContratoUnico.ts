import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type GetHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  id: number,
  nombre: string
): AxiosPromise<GetHttpResponseBody> => {
  return axios.http.get(
    'Integracion/Contrato/ChequearNombreUnico/' + id + '/' + nombre
  );
};

export const chequearNombreContratoUnico = (
  id: number,
  nombre: string
): Promise<GetHttpResponseBody> => makeHttpRequest(id, nombre);
