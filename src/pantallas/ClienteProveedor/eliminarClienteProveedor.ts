import { number } from 'yup';
import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type DeleteClienteProveedorHttpResponseBody = unknown;
export type DeleteClienteProveedorHttpRequestParams = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  proveedor: number
): AxiosPromise<DeleteClienteProveedorHttpRequestParams> => {
  var id = proveedor;
  return axios.http.delete('ClienteProveedor/' + id);
};

export const eliminarClienteProveedor = (proveedor: number) =>
  makeHttpRequest(proveedor);
