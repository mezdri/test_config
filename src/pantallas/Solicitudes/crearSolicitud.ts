import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type categoria = {
  IDSubcategoria: string;
  IDCategoria: string;
  Categoria: string;
  Subcategoria: string;
};

type listaArchivos = {
  NombreArchivo: string;
  Archivo: string;
};

type HttpRequestBody = {
  IDPlataforma: string;
  IDOrigen: string;
  IDTipo: string;
  ContactoNombre: string;
  ContactoApellidos: string;
  ContactoTelefono: string;
  ContactoEmail: string;
  Titulo: string;
  Descripcion: string;
  Idepc: string;
  Categoria: categoria;
};

const axios = new AxiosVue(ServicioProxy.Comercial);
const makeHttpRequest = (
  solicitud: CreacionSolicitud
): AxiosPromise<unknown> => {
  const body: HttpRequestBody = {
    IDPlataforma: solicitud.IDPlataforma,
    IDOrigen: solicitud.IDOrigen,
    IDTipo: solicitud.IDTipo,
    ContactoNombre: solicitud.ContactoNombre,
    ContactoApellidos: solicitud.ContactoApellidos,
    ContactoTelefono: solicitud.ContactoTelefono,
    ContactoEmail: solicitud.ContactoEmail,
    Titulo: solicitud.Titulo,
    Descripcion: solicitud.Descripcion,
    Idepc: solicitud.Idepc,
    Categoria: solicitud.Categoria,
  };
  return axios.http.post(`Comercial/solicitud`, body);
};

export type CreacionSolicitud = {
  IDPlataforma: string;
  IDOrigen: string;
  IDTipo: string;
  ContactoNombre: string;
  ContactoApellidos: string;
  ContactoTelefono: string;
  ContactoEmail: string;
  Titulo: string;
  Descripcion: string;
  Idepc: string;
  Categoria: categoria;
};

export const crearSolicitud = (solicitud: CreacionSolicitud) =>
  makeHttpRequest(solicitud);
