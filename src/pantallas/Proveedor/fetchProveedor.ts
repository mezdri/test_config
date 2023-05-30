import { Proveedor } from './Proveedor';
import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type GetProveedorHttpResponseBody = Proveedor;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  proveedor: number
): AxiosPromise<GetProveedorHttpResponseBody> => {
  var idclienteproveedor = proveedor;
  return axios.http.get('Proveedor/Buscar/' + idclienteproveedor);
};

export const fetchProveedor = (proveedor: number) => makeHttpRequest(proveedor);
