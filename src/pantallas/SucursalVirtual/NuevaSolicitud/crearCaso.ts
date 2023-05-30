import { object, array, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import config from '@/config/index';
import { ServicioProxy, TipoFrecuenciasCalendario } from '@/config/enums';

type CrearCasoHttpResponseBody = unknown;
export type CrearCasoHttpRequestParams = {
  empresa?: string;
  tipo?: string;
  categoria?: string;
  patente?: string[];
  descripcion?: string;
  filename?: string;
  file?: string;
  tipoContacto?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  enviarComoComentario?: boolean;
  notif?: string;
};
type MsData = {
  status: string;
  msg: string;
};

type MsResponseData = {
  CODIGO_RESPUESTA: string;
  MENSAJE_RESPUESTA: string;
  numCasosPatentes: any;
  numCasosSinPatentes: string[];
};

const axios = new AxiosVue(ServicioProxy.Metabase);

export type params = {
  request: request;
};
export type request = {
  Empresa?: string;
  Tipo?: string;
  Categoria?: string;
  Patente?: string[];
  Descripcion?: string;
  Filename?: string;
  File?: string;
  TipoContacto?: string;
  Nombre?: string;
  Apellido?: string;
  Email?: string;
  Telefono?: string;
  Direccion?: string;
  EnviarComoComentario?: boolean;
  Notif?: string;
  user_id?: string;
  nuevaDireccion?: any[];
  patentesNew?: string[];
};

const makeHttpRequest = (
  empresa: string,
  tipo: string,
  categoria: string,
  patente: string[],
  descripcion: string,
  filename: string,
  file: string,
  tipoContacto: string,
  nombre: string,
  apellido: string,
  email: string,
  telefono: string,
  direccion: string,
  enviarComoComentario: boolean,
  notif: string,
  nuevaDireccion: any[],
  patentesNew: string[]
): AxiosPromise<MsResponseData> => {
  let params: params = {
    request: {
      Empresa: empresa,
      Tipo: tipo,
      Categoria: categoria,
      Patente: patente,
      Descripcion: descripcion,
      Filename: filename,
      File: file,
      TipoContacto: tipoContacto,
      Nombre: nombre,
      Apellido: apellido,
      Email: email,
      Telefono: telefono,
      Direccion: direccion,
      EnviarComoComentario: enviarComoComentario,
      Notif: notif,
      nuevaDireccion: nuevaDireccion,
      patentesNew: patentesNew,
      user_id: JSON.parse(window.localStorage.user).id.toString(),
    },
  };
  return axios.http.post(`Metabase/PostgenericA/track/crearCasoSucursal`, {
    params: params.request,
  });
};

const getResponseData = (
  axiosResponse: AxiosResponse<MsResponseData>
): MsResponseData => {
  try {
    const x = axiosResponse.data;
    return x != undefined ? x : null;
  } catch {
    return null;
  }
};

const schema = object({});

const getMaybeValidData = (data: MsResponseData): Promise<MsResponseData> => {
  return schema
    .isValid(data, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? data : null));
};

export const crearCaso = (
  empresa: string,
  tipo: string,
  categoria: string,
  patente: string[],
  descripcion: string,
  filename: string,
  file: string,
  tipoContacto: string,
  nombre: string,
  apellido: string,
  email: string,
  telefono: string,
  direccion: string,
  enviarComoComentario: boolean,
  notif: string,
  nuevaDireccion: any[],
  patentesNew: string[]
) =>
  makeHttpRequest(
    empresa,
    tipo,
    categoria,
    patente,
    descripcion,
    filename,
    file,
    tipoContacto,
    nombre,
    apellido,
    email,
    telefono,
    direccion,
    enviarComoComentario,
    notif,
    nuevaDireccion,
    patentesNew
  ).then(getResponseData);
