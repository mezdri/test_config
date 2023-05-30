import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Mensaje } from './mensaje';

type MensajeBackend = {
  id: number;
  titulo: string;
  mensaje: string;
  estado: number;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
};

type MensajeHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Copiloto);

const makeHttpRequest = (): AxiosPromise<MensajeHttpResponseBody> => {
  return axios.http.get('MensajeCopiloto/getMensajes');
};

const schema = object({
  id: string().ensure(),
  titulo: string().ensure(),
  mensaje: string().ensure(),
  estado: string().ensure(),
  fechaModificacion: string().ensure(),
  usuarioModifica: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioCreador: string().ensure(),
});

const getMaybeValidMensaje = (
  Mensaje: MensajeBackend
): Promise<MensajeBackend | null> => {
  return schema
    .isValid(Mensaje, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? Mensaje : null));
};

const getResponseData = (
  axiosResponse: AxiosResponse<MensajeHttpResponseBody>
): MensajeBackend[] => {
  try {
    const maybeMensaje = axiosResponse.data;
    return maybeMensaje instanceof Array ? maybeMensaje : [];
  } catch {
    return [];
  }
};

const parseMensaje = (x: MensajeBackend): Mensaje => ({
  id: x.id,
  titulo: x.titulo,
  mensaje: x.mensaje,
  estado: x.estado,
  fechaCreacion: moment(x.fechaCreacion),
  fechaModificacion: moment(x.fechaModificacion),
  usuarioCreador: x.usuarioCreador,
  usuarioModifica: x.usuarioModifica,
});

export const fetchMensaje = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Mensaje): Promise<Array<MensajeBackend | null>> =>
        Promise.all(Mensaje.map(getMaybeValidMensaje))
    )
    .then(Mensaje => Mensaje.filter(x => x))
    .then(Mensaje => Mensaje.map(parseMensaje));

// Variables //
