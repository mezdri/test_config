import { object, string, array, number } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Envio } from '@/interfaces/Envio';

type HttpResponseBody = Envio;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (id: number): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('Integracion/Envio/' + id);
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): Envio => {
  try {
    return axiosResponse.data;
  } catch {
    return null;
  }
};

const schema = object({
  id: string().ensure(),
  proveedorId: string().ensure(),
  clienteProveedorId: string().ensure(),
  contratoId: string().ensure(),
  usuario: string().ensure(),
  password: string().ensure(),
  endpoint: string().ensure(),
  fechaIni: string().ensure(),
  fechaFin: string().ensure(),
  apiKey: string().ensure(),
  estado: string().ensure(),
  flotas: array(number()),
  etiquetas: array(number()),
  vehiculos: array(number()),
});

const getMaybeValid = (envio: Envio): Promise<Envio | null> => {
  return schema
    .isValid(envio, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? envio : null));
};

const parseEnvio = (x: Envio): Envio => ({
  id: x.id,
  proveedorId: x.proveedorId,
  clienteProveedorId: x.clienteProveedorId,
  contratoId: x.contratoId,
  usuario: x.usuario,
  password: x.password,
  endpoint: x.endpoint,
  fechaIni: moment(x.fechaIni),
  fechaFin: moment(x.fechaFin),
  apiKey: x.apiKey,
  estado: x.estado,
  flotas: x.flotas,
  etiquetas: x.etiquetas,
  vehiculos: x.vehiculos,
});

export const fetchByIdEnvio = (id: number): Promise<Envio> =>
  makeHttpRequest(id)
    .then(getResponseData)
    .then(getMaybeValid)
    .then(parseEnvio);
