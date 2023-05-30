import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import { ListaDistribucion } from '@/pantallas/ListaDistribucion/ListaDistribucion';

type ListaDistribucionBackend = {
  id: number;
  nombre: string;
  descripcion: string;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
  estado: number;
  estadoTxt: string;
  totalAsociados: number;
};

type ListaDistribucionHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Contacto);

const makeHttpRequest = (): AxiosPromise<ListaDistribucionHttpResponseBody> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(`ListaDistribucionB/grid2/${clienteId}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<ListaDistribucionHttpResponseBody>
): ListaDistribucionBackend[] => {
  try {
    const maybeListaDistribucion = axiosResponse.data;
    return maybeListaDistribucion instanceof Array
      ? maybeListaDistribucion
      : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidLista = (
  listaDistribucion: ListaDistribucionBackend
): Promise<ListaDistribucionBackend | null> => {
  return schema
    .isValid(listaDistribucion, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? listaDistribucion : null));
};

const parseListaDistribucion = (
  x: ListaDistribucionBackend
): ListaDistribucion => ({
  id: x.id,
  nombre: x.nombre,
  descripcion: x.descripcion,
  fechaModificacion: moment(x.fechaModificacion),
  usuarioModifica: x.usuarioModifica === null ? '' : x.usuarioModifica,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioCreador: x.usuarioCreador,
  estado: x.estado === 1,
  estadoTxt: x.estadoTxt,
  totalAsociados: x.totalAsociados,
});

export const fetchListasDistribucion = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (ListasDistribucion): Promise<Array<ListaDistribucionBackend | null>> =>
        Promise.all(ListasDistribucion.map(getMaybeValidLista))
    )
    .then(ListasDistribucion => ListasDistribucion.filter(x => x))
    .then(ListasDistribucion => ListasDistribucion.map(parseListaDistribucion));
