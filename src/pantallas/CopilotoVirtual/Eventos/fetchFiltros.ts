import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { EventoTipo } from './tipoEvento';

type EventoTipoBackend = {
  id: number;
  nombre: string;
};

type EventoHttpResponseBody = unknown;
const axios = new AxiosVue(ServicioProxy.Copiloto);
const makeHttpRequest = (): AxiosPromise<EventoHttpResponseBody> => {
  return axios.http.get('EventoCopiloto/getTipoEvento');
};

const schema = object({
  Id: string().ensure(),
  Nombre: string().ensure(),
});

const getMaybeValidEvento = (
  EventoTipo: EventoTipoBackend
): Promise<EventoTipoBackend | null> => {
  return schema
    .isValid(EventoTipo, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? EventoTipo : null));
};

const getResponseData = (
  axiosResponse: AxiosResponse<EventoHttpResponseBody>
): EventoTipoBackend[] => {
  try {
    const maybeMensaje = axiosResponse.data;

    return maybeMensaje instanceof Array ? maybeMensaje : [];
  } catch {
    return [];
  }
};

const parseEventoTipo = (x: EventoTipoBackend): EventoTipo => ({
  id: x.id,
  nombre: x.nombre,
});

export const fetchTipoEvento = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Mensaje): Promise<Array<EventoTipoBackend | null>> =>
        Promise.all(Mensaje.map(getMaybeValidEvento))
    )
    .then(Evento => Evento.filter(x => x))
    .then(Evento => Evento.map(parseEventoTipo));
