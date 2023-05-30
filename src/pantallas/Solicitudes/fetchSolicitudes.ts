import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import {
  makeNullableDuration,
  makeNullableMoment,
} from '@/reusable/Data/dataUtils';

type SolicitudBackend = {
  idCaso: string;
  fechaCreacion: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  idCategoria: string;
  categoria: string;
  idSubcategoria: string;
  subcategoria: string;
  titulo: string;
  descripcion: string;
  fechaResolucion: string;
  resolucion: string;
  estado: string;
  numeroResolucion: string;
};

type SolicitudHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Comercial);

const makeHttpRequest = (
  fechaInicio: string,
  fechaFin: string
): AxiosPromise<SolicitudHttpResponseBody> => {
  let params: params = {
    request: {
      FechaCreacionIni: fechaInicio,
      FechaCreacionFin: fechaFin,
    },
  };
  return axios.http.get(`Comercial/solicitud`, {
    params: params.request,
  });
};

export type params = {
  request: request;
};

export type request = {
  FechaCreacionIni: string;
  FechaCreacionFin: string;
};

const getResponseData = (
  axiosResponse: AxiosResponse<SolicitudHttpResponseBody>
): SolicitudBackend[] => {
  try {
    const maybeCategoria = axiosResponse.data;
    return maybeCategoria instanceof Array ? maybeCategoria : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidLista = (
  categoria: SolicitudBackend
): Promise<SolicitudBackend | null> => {
  return schema
    .isValid(categoria, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? categoria : null));
};

export type Solicitud = {
  idCaso: string;
  fechaCreacion: moment.Moment;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  idCategoria: string;
  categoria: string;
  idSubcategoria: string;
  subcategoria: string;
  titulo: string;
  descripcion: string;
  fechaResolucion: moment.Moment;
  resolucion: string;
  estado: string;
  numeroResolucion: string;
};

const parseCategoria = (x: SolicitudBackend): Solicitud => ({
  idCaso: x.idCaso,
  fechaCreacion: makeNullableMoment(x.fechaCreacion),
  nombres: x.nombres,
  apellidos: x.apellidos,
  telefono: x.telefono,
  email: x.email,
  idCategoria: x.idCategoria,
  categoria: x.categoria,
  idSubcategoria: x.idSubcategoria,
  subcategoria: x.subcategoria,
  titulo: x.titulo,
  descripcion: x.descripcion,
  fechaResolucion: makeNullableMoment(x.fechaResolucion),
  resolucion: x.resolucion,
  estado: x.estado,
  numeroResolucion: x.numeroResolucion,
});

export const fetchSolicitudes = (fechaInicio: string, fechaFin: string) =>
  makeHttpRequest(fechaInicio, fechaFin)
    .then(getResponseData)
    .then(
      (Categorias): Promise<Array<SolicitudBackend | null>> =>
        Promise.all(Categorias.map(getMaybeValidLista))
    )
    .then(Categorias => Categorias.filter(x => x))
    .then(Categorias => Categorias.map(parseCategoria));
