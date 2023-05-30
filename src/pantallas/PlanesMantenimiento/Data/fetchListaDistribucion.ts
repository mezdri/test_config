import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import { ListaDistribucionPlanMantenimiento } from './PlanMantenimiento';

type ListaDistribucionBackend = {
  id: number;
  nombre: string;
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
): ListaDistribucionPlanMantenimiento => ({
  id: x.id,
  nombre: x.nombre,
  tipo: 'Lista de Distribución',
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
