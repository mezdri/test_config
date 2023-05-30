import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { ClienteProveedor } from '@/pantallas/ClienteProveedor/ClienteProveedor';

type EditHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  clienteProveedor: ClienteProveedor
): AxiosPromise<EditHttpResponseBody> => {
  return axios.http.put('ClienteProveedor', clienteProveedor);
};

export const editarClienteProveedor = (clienteProveedor: any) =>
  makeHttpRequest(clienteProveedor);
