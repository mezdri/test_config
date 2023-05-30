import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import { ContactoAsociado } from '@/pantallas/ListaDistribucion/ListaDistribucion';

type ContactoAsociadoBackend = {
  id: number;
  nombre: string;
  tipoText: string;
  estado: string;
  correo: string;
};

type ContactoAsociadoHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Contacto);

const makeHttpRequest = (
  idLista: number
): AxiosPromise<ContactoAsociadoHttpResponseBody> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(
    `ListaDistribucionB/listarTodos/${clienteId}/${idLista}`
  );
};

const getResponseData = (
  axiosResponse: AxiosResponse<ContactoAsociadoHttpResponseBody>
): ContactoAsociadoBackend[] => {
  try {
    const maybeLista = axiosResponse.data;
    return maybeLista instanceof Array ? maybeLista : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidContactosAsociados = (
  contactosAsociados: ContactoAsociadoBackend
): Promise<ContactoAsociadoBackend | null> => {
  return schema
    .isValid(contactosAsociados, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? contactosAsociados : null));
};

const parseContactoAsociado = (
  x: ContactoAsociadoBackend
): ContactoAsociado => ({
  id: x.id,
  nombre: x.nombre,
  tipoText: x.tipoText,
  estado: x.estado,
  correo: x.correo,
});

export const fetchContactosAsociados = (idLista: number) =>
  makeHttpRequest(idLista)
    .then(getResponseData)
    .then(
      (Lista): Promise<Array<ContactoAsociadoBackend | null>> =>
        Promise.all(Lista.map(getMaybeValidContactosAsociados))
    )
    .then(Lista => Lista.filter(x => x))
    .then(Lista => Lista.map(parseContactoAsociado));
