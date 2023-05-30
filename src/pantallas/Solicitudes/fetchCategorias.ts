import { object, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

export type CategoriaBackend = {
  idCategoria: string;
  categoria: string;
};

type CategoriaHttpResponseBody = unknown;
export type FetchCategoriaHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
};

const axios = new AxiosVue(ServicioProxy.Comercial);

const makeHttpRequest = (): AxiosPromise<CategoriaHttpResponseBody> => {
  const body: FetchCategoriaHttpRequestBody = {
    clienteId: config.getClienteSesion(),
    usuarioId: store.state.userId,
  };
  return axios.http.get('Comercial/categorias');
};

const getResponseData = (
  axiosResponse: AxiosResponse<CategoriaHttpResponseBody>
): CategoriaBackend[] => {
  try {
    const maybeCategorias = axiosResponse.data;
    return maybeCategorias instanceof Array ? maybeCategorias : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidRecepcion = (
  categoria: CategoriaBackend
): Promise<CategoriaBackend | null> => {
  return schema
    .isValid(categoria, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? categoria : null));
};

export type Categorias = {
  idCategoria: string;
  categoria: string;
};

const parseGiro = (x: CategoriaBackend): Categorias => ({
  idCategoria: x.idCategoria,
  categoria: x.categoria,
});

export const fetchCategorias = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Categoria): Promise<Array<CategoriaBackend | null>> =>
        Promise.all(Categoria.map(getMaybeValidRecepcion))
    )
    .then(Categoria => Categoria.filter(x => x))
    .then(Categoria => Categoria.map(parseGiro));
