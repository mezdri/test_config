import { object, string, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';

export type SubCategoriaBackend = {
  idSubcategoria: string;
  idCategoria: string;
  subcategoria: string;
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
  return axios.http.get('Comercial/subcategorias');
};

const getResponseData = (
  axiosResponse: AxiosResponse<CategoriaHttpResponseBody>
): SubCategoriaBackend[] => {
  try {
    const maybeCategorias = axiosResponse.data;
    return maybeCategorias instanceof Array ? maybeCategorias : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidRecepcion = (
  categoria: SubCategoriaBackend
): Promise<SubCategoriaBackend | null> => {
  return schema
    .isValid(categoria, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? categoria : null));
};

export type SubCategorias = {
  idSubcategoria: string;
  idCategoria: string;
  subcategoria: string;
};

const parseSubCat = (x: SubCategoriaBackend): SubCategorias => ({
  idSubcategoria: x.idSubcategoria,
  idCategoria: x.idCategoria,
  subcategoria: x.subcategoria,
});

export const fetchSubCategorias = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Categoria): Promise<Array<SubCategoriaBackend | null>> =>
        Promise.all(Categoria.map(getMaybeValidRecepcion))
    )
    .then(Categoria => Categoria.filter(x => x))
    .then(Categoria => Categoria.map(parseSubCat));
