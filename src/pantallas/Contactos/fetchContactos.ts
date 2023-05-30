import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import moment from 'moment';
import { Contacto } from '@/pantallas/Contactos/Contacto';
import config from '@/config/index';

type ContactoBackend = {
  id: number;
  nombre: string;
  correo: string;
  fono: string;
  empresa: string;
  rut: string;
  tipoContactoId: number;
  tipoContactoText: string;
  usuarioCreador: string;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  fechaModificacion: moment.Moment;
  estado: number;
  estadoTxt: string;
  listaDistribucionId?: number[];
  totalAsociados?: number;
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
  correo: string().ensure(),
  fono: string().ensure(),
  empresa: string().ensure(),
  rut: string().ensure(),
  tipoContactoId: string().ensure(),
  tipoContactoText: string().ensure(),
  usuarioCreador: string().ensure(),
  usuarioModifica: string().ensure(),
  fechaCreacion: string().ensure(),
  fechaModificacion: string().ensure(),
  estado: string().ensure(),
  estadoTxt: string().ensure(),
  listaDistribucionId: string().ensure(),
  totalAsociados: string().ensure(),
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

const parseContacto = (x: ContactoBackend): Contacto => ({
  id: x.id,
  nombre: x.nombre,
  correo: x.correo,
  fono: x.fono,
  empresa: x.empresa,
  rut: x.rut,
  tipoContactoId: x.tipoContactoId,
  tipoContactoText: x.tipoContactoText,
  usuarioCreador: x.usuarioCreador,
  usuarioModifica: x.usuarioModifica === null ? '' : x.usuarioModifica,
  fechaCreacion: moment(x.fechaCreacion),
  fechaModificacion: moment(x.fechaModificacion),
  estado: x.estado,
  estadoTxt: x.estadoTxt,
  listaDistribucionId: x.listaDistribucionId,
  totalAsociados: x.totalAsociados,
});

export const fetchContactos = (): Promise<Contacto[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (contactos): Promise<Array<ContactoBackend | null>> =>
        Promise.all(contactos.map(getMaybeValidContacto))
    )
    .then(contactos => contactos.filter(x => x))
    .then(contactos => contactos.map(parseContacto));
