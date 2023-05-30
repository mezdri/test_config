import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { ClienteProveedor } from '@/pantallas/ClienteProveedor/ClienteProveedor';

type CreateHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  clienteProveedor: any
): AxiosPromise<CreateHttpResponseBody> => {
  return axios.http.post('ClienteProveedor', clienteProveedor);
};

export const crearClienteProveedor = (clienteProveedor: any) =>
  makeHttpRequest(clienteProveedor);
