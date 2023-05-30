import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type GetClienteProveedorHttpResponseBody = any;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  proveedor: any
): AxiosPromise<GetClienteProveedorHttpResponseBody> => {
  var idclienteproveedor = proveedor;
  return axios.http.get(
    'ClienteProveedor/ExisteRecepcion/' + idclienteproveedor
  );
};

export const fetchAsociacionCliente = (proveedor: any) =>
  makeHttpRequest(proveedor);
