import { BooleanAsNumber } from './../../reusable/Data/dataUtils';
import { ListaDistribucionNueva } from '@/pantallas/ListaDistribucion/ListaDistribucion';
import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import config from '@/config/index';
import { ServicioProxy } from '@/config/enums';

type CrearListaDistribucionHttpResponseBody = unknown;
export type CrearListaDistribucionHttpRequestParams = {
  nombre: string;
  estado: BooleanAsNumber;
  clienteId: number;
};

const axios = new AxiosVue(ServicioProxy.Contacto);

const makeHttpRequest = (
  listaDistribucion: ListaDistribucionNueva
): AxiosPromise<CrearListaDistribucionHttpResponseBody> => {
  const params: CrearListaDistribucionHttpRequestParams = {
    ...listaDistribucion,
    estado: listaDistribucion.estado ? 1 : 0,
    clienteId: config.getClienteSesion(),
  };
  return axios.http.post('ListaDistribucionB', params);
};

export const crearListaDistribucion = (
  listaDistribucion: ListaDistribucionNueva
) => makeHttpRequest(listaDistribucion);
