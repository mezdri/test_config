import { ClienteProveedor } from './ClienteProveedor';
import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type GetClienteProveedorHttpResponseBody = ClienteProveedor;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  proveedor: number
): AxiosPromise<GetClienteProveedorHttpResponseBody> => {
  var idclienteproveedor = proveedor;
  return axios.http.get('ClienteProveedor/Buscar/' + idclienteproveedor);
};

export const fetchClienteProveedor = (proveedor: number) =>
  makeHttpRequest(proveedor);
