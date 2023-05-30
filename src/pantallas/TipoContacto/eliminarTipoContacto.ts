import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { TipoContacto } from '@/pantallas/TipoContacto/TipoContacto';

type DeleteTipoContactoHttpResponseBody = unknown;
export type DeleteTipoContactoHttpRequestParams = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Contacto);

const makeHttpRequest = (
  tipoContacto: TipoContacto
): AxiosPromise<DeleteTipoContactoHttpResponseBody> => {
  return axios.http.delete(`TipoContactos/${tipoContacto.id}`);
};

export const eliminarTipoContacto = (tipoContacto: TipoContacto) =>
  makeHttpRequest(tipoContacto);
