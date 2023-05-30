import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Contacto } from '@/pantallas/Contactos/Contacto';
import config from '@/config/index';

type DeleteContactoHttpResponseBody = unknown;
export type DeleteContactoHttpRequestParams = {
  id: number;
};

const axios = new AxiosVue(ServicioProxy.Contacto);

const makeHttpRequest = (
  contacto: Contacto
): AxiosPromise<DeleteContactoHttpResponseBody> => {
  const clienteId = config.getClienteSesion();
  return axios.http.delete(`Contactos/${contacto.id}/${clienteId}`);
};

export const eliminarContacto = (contacto: Contacto) =>
  makeHttpRequest(contacto);
