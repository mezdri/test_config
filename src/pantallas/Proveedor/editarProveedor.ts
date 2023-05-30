import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Proveedor } from '@/pantallas/Proveedor/Proveedor';

type EditHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (
  proveedor: Proveedor
): AxiosPromise<EditHttpResponseBody> => {
  return axios.http.put('Proveedor', proveedor);
};

export const editarProveedor = (proveedor: any) => makeHttpRequest(proveedor);
