import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Envio } from '@/interfaces/Envio';

type HttpResponseBody = Envio;

const axios = new AxiosVue(ServicioProxy.Integracion);

const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('Integracion/Envio');
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): Envio[] => {
  try {
    const maybe = axiosResponse.data;
    return maybe instanceof Array ? maybe : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  proveedor: string().ensure(),
  clienteProveedor: string().ensure(),
  contratoNombre: string().ensure(),
  usuario: string().ensure(),
  password: string().ensure(),
  endpoint: string().ensure(),
  fechaIni: string().ensure(),
  fechaFin: string().ensure(),
  apiKey: string().ensure(),
  estadoTxt: string().ensure(),
  usuarioCreacion: string().ensure(),
  fechaCreacion: string().ensure(),
  fechaCreacionTxt: string().ensure(),
  usuarioModificacion: string().ensure(),
  fechaModificacion: string().ensure(),
  fechaModificacionTxt: string().ensure(),
  ultimoEnvio: string().ensure(),
});

const getMaybeValid = (contratoProveedor: Envio): Promise<Envio | null> => {
  return schema
    .isValid(contratoProveedor, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? contratoProveedor : null));
};

const parseEnvio = (x: Envio): Envio => ({
  id: x.id,
  proveedor: x.proveedor,
  clienteProveedor: x.clienteProveedor,
  contratoNombre: x.contratoNombre,
  usuario: x.usuario === null ? '' : x.usuario,
  password: '**********'.toString(),
  endpoint: x.endpoint === null ? '' : x.endpoint,
  fechaIni: moment(x.fechaIni),
  fechaFin: moment(x.fechaFin),
  apiKey: x.apiKey === null ? '' : x.apiKey,
  estado: x.estado,
  estadoTxt: x.estadoTxt,
  usuarioCreacion: x.usuarioCreacion === null ? '' : x.usuarioCreacion,
  fechaCreacion: moment(x.fechaCreacion),
  fechaCreacionTxt: x.fechaCreacionTxt,
  usuarioModificacion:
    x.usuarioModificacion === null ? '' : x.usuarioModificacion,
  fechaModificacion: moment(x.fechaModificacion),
  fechaModificacionTxt: x.fechaModificacionTxt,
  ultimoEnvio: moment(x.ultimoEnvio),
});

export const fetchEnvios = (): Promise<Envio[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then((c): Promise<Array<any | null>> => Promise.all(c.map(getMaybeValid)))
    .then(c => c.filter(x => x))
    .then(c => c.map(parseEnvio));
