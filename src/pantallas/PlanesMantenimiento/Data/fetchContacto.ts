import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import moment from 'moment';
import { ContactosPlanMantenimiento } from './PlanMantenimiento';
import config from '@/config/index';

type ContactoBackend = {
  id: number;
  nombre: string;
};

type ContactosHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Contacto);

const makeHttpRequest = (): AxiosPromise<ContactosHttpResponseBody> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(`Contactos/grid2/${clienteId}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<ContactosHttpResponseBody>
): ContactoBackend[] => {
  try {
    const maybeContactos = axiosResponse.data;
    return maybeContactos instanceof Array ? maybeContactos : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
});

const getMaybeValidContacto = (
  contacto: ContactoBackend
): Promise<ContactoBackend | null> => {
  return schema
    .isValid(contacto, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? contacto : null));
};

const parseContacto = (x: ContactoBackend): ContactosPlanMantenimiento => ({
  id: x.id,
  nombre: x.nombre,
  tipo: 'Contacto',
});

export const fetchContactos = (): Promise<ContactosPlanMantenimiento[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (contactos): Promise<Array<ContactoBackend | null>> =>
        Promise.all(contactos.map(getMaybeValidContacto))
    )
    .then(contactos => contactos.filter(x => x))
    .then(contactos => contactos.map(parseContacto));
