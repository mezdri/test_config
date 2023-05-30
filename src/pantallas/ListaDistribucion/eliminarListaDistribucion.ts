import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { ListaDistribucion } from '@/pantallas/ListaDistribucion/ListaDistribucion';
import config from '@/config/index';

type DeleteListaDistribucionHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Contacto);

const makeHttpRequest = (
  listaDistribucion: ListaDistribucion
): AxiosPromise<DeleteListaDistribucionHttpResponseBody> => {
  const clienteId = config.getClienteSesion();
  return axios.http.delete(`ListaDistribucionB/${listaDistribucion.id}`);
};

export const eliminarListaDistribucion = (
  listaDistribucion: ListaDistribucion
) => makeHttpRequest(listaDistribucion);
