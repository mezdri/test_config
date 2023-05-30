import { array, number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type CampoBackend = {
  id: number;
  nombre: string;
};

const axios = new AxiosVue(ServicioProxy.Integracion);
const makeHttpRequest = (): AxiosPromise<CampoBackend[]> => {
  return axios.http.get('integracion/campo');
};

const getResponseData = (
  axiosResponse: AxiosResponse<CampoBackend[]>
): CampoBackend[] => axiosResponse.data;

const schema = array(
  object({
    id: number(),
    nombre: string(),
  })
);

const getMaybeValidData = (data: CampoBackend[]): Promise<CampoBackend[]> => {
  return schema
    .isValid(data, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? data : null));
};

export type Campo = {
  id: number;
  nombre: string;
};

const parse = (campo: CampoBackend): Campo => campo;

export const fetchCampos = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(getMaybeValidData)
    .then(descargas => descargas.filter(x => x))
    .then(x => x.map(parse));
