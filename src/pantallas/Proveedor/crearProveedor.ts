import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Proveedor } from '@/pantallas/Proveedor/Proveedor';

type CreateHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  proveedor: any
): AxiosPromise<CreateHttpResponseBody> => {
  return axios.http.post('Proveedor', proveedor);
};

export const crearProveedor = (proveedor: any) => makeHttpRequest(proveedor);
