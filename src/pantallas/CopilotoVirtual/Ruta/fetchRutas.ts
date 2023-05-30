import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import { Ruta } from './rutas';

type RutaBackend = {
  id: number;
  clienteId: number;
  nombre: string;
  usuarioCreadorId: string;
  usuarioCreador: string;
  nombreModificador: string;
  fechaCreacion?: moment.Moment;
  usuarioModificacionId?: number;
  fechaModificacion?: moment.Moment;
};

type RutaHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Copiloto);

const makeHttpRequest = (): AxiosPromise<RutaHttpResponseBody> => {
  return axios.http.get('RutaCopiloto/getRutas');
};

const schema = object({
  id: string().ensure(),
  clienteId: string().ensure(),
  nombre: string().ensure(),
  usuarioCreadorId: string().ensure(),
  usuarioCreador: string().ensure(),
  nombreModificador: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioModificacionId: string().ensure(),
  fechaModificacion: string().ensure(),
});

const getMaybeValidMensaje = (
  Ruta: RutaBackend
): Promise<RutaBackend | null> => {
  return schema
    .isValid(Ruta, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? Ruta : null));
};

const getResponseData = (
  axiosResponse: AxiosResponse<RutaHttpResponseBody>
): RutaBackend[] => {
  try {
    const maybeMensaje = axiosResponse.data;
    return maybeMensaje instanceof Array ? maybeMensaje : [];
  } catch {
    return [];
  }
};

const parseResponse = (x: RutaBackend): Ruta => ({
  id: x.id,
  clienteId: x.clienteId,
  nombre: x.nombre,
  usuarioCreadorId: x.usuarioCreadorId,
  usuarioCreador: x.usuarioCreador,
  nombreModificador: x.nombreModificador,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioModificacionId: x.usuarioModificacionId,
  fechaModificacion: moment(x.fechaModificacion),
});

export const fetchRutas = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Ruta): Promise<Array<RutaBackend | null>> =>
        Promise.all(Ruta.map(getMaybeValidMensaje))
    )
    .then(Ruta => Ruta.filter(x => x))
    .then(Ruta => Ruta.map(parseResponse));
