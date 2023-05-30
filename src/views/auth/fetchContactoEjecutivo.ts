import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';

type datos = {
  nombre: string;
  telefono: string;
  email: string;
};

type ContactoEjecutivoBackend = {
  ejecCobranza: datos;
  ejecComercial: datos;
  tecnico: datos;
};

type ContactoEjecutivoHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Comercial);

//llama al servicio
const makeHttpRequest = (): AxiosPromise<ContactoEjecutivoHttpResponseBody> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(`comercial/contactoejecutivocomercial`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<ContactoEjecutivoHttpResponseBody>
): ContactoEjecutivoBackend[] => {
  try {
    const maybeContactoEjecutivo = axiosResponse.data;
    return maybeContactoEjecutivo instanceof Array
      ? maybeContactoEjecutivo
      : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidLista = (
  contactoEjecutivo: ContactoEjecutivoBackend
): Promise<ContactoEjecutivoBackend | null> => {
  return schema
    .isValid(contactoEjecutivo, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? contactoEjecutivo : null));
};

export type ContactoEjecutivo = {
  nombreEjecCobranza: string;
  telefonoEjecCobranza: string;
  emailEjecCobranza: string;

  nombreEjeComercial: string;
  telefonoEjeComercial: string;
  emailEjeComercial: string;

  nombreTecnico: string;
  telefonoTecnico: string;
  emailTecnico: string;
};

const parseContactoEjecutivo = (
  x: ContactoEjecutivoBackend
): ContactoEjecutivo => ({
  nombreEjecCobranza: x.ejecCobranza.nombre,
  emailEjecCobranza: x.ejecCobranza.email,
  telefonoEjecCobranza: x.ejecCobranza.telefono,

  nombreEjeComercial: x.ejecComercial.nombre,
  emailEjeComercial: x.ejecComercial.email,
  telefonoEjeComercial: x.ejecComercial.telefono,

  nombreTecnico: x.tecnico.nombre,
  emailTecnico: x.tecnico.email,
  telefonoTecnico: x.tecnico.telefono,
});

export const fetchContactoEjecutivo = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (ContactoEjecutivo): Promise<Array<ContactoEjecutivoBackend | null>> =>
        Promise.all(ContactoEjecutivo.map(getMaybeValidLista))
    )
    .then(ContactoEjecutivo => ContactoEjecutivo.filter(x => x))
    .then(ContactoEjecutivo => ContactoEjecutivo.map(parseContactoEjecutivo));
