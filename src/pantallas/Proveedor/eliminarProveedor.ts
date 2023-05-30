import { number } from 'yup';
import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type DeleteProveedorHttpResponseBody = unknown;
export type DeleteProveedorHttpRequestParams = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  proveedor: number
): AxiosPromise<DeleteProveedorHttpRequestParams> => {
  var id = proveedor;
  return axios.http.delete('Proveedor/' + id);
};

export const eliminarProveedor = (proveedor: number) =>
  makeHttpRequest(proveedor);
