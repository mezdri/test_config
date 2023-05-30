import { BooleanAsNumber } from './../../reusable/Data/dataUtils';
import { ListaDistribucionNueva } from '@/pantallas/ListaDistribucion/ListaDistribucion';

import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type EditarListaDistribucionHttpResponseBody = unknown;
export type EditarListaDistribucionHttpRequestParams = {
  id?: number;
  nombre: string;
  estado: BooleanAsNumber;
};

const axios = new AxiosVue(ServicioProxy.Contacto);

const makeHttpRequest = (
  listaDistribucion: ListaDistribucionNueva
): AxiosPromise<EditarListaDistribucionHttpResponseBody> => {
  const params: EditarListaDistribucionHttpRequestParams = {
    ...listaDistribucion,
    estado: listaDistribucion.estado ? 1 : 0,
  };
  return axios.http.put('ListaDistribucionB', params);
};

export const editarListaDistribucion = (
  listaDistribucion: ListaDistribucionNueva
) => makeHttpRequest(listaDistribucion);
