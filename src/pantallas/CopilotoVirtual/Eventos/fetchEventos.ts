import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { evento } from './evento';

type EventoBackend = {
  clienteId: number;
  conductorId: number;
  id: number;
  conductorNombre: string;
  mensajeId: number;
  mensaje: string;
  tituloMensaje: number;
  coordenadaId: number;
  coordenadaNombre: string;
  eventoId: number;
  eventoNombre: string;
  rutaId: number;
  rutaNombre: string;
  latitud: string;
  longitud: string;
  linkMapa: string;
  patente: string;
  fechaTxt: string;
  velocidadActual: number;
};

type HttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Copiloto);

const makeHttpRequest = (): AxiosPromise<HttpResponseBody> => {
  return axios.http.get('EventoCopiloto/getEventos');
};

const schema = object({
  clienteId: string().ensure(),
  conductorId: string().ensure(),
  id: string().ensure(),
  conductorNombre: string().ensure(),
  mensajeId: string().ensure(),
  mensaje: string().ensure(),
  tituloMensaje: string().ensure(),
  coordenadaId: string().ensure(),
  coordenadaNombre: string().ensure(),
  eventoId: string().ensure(),
  eventoNombre: string().ensure(),
  rutaId: string().ensure(),
  rutaNombre: string().ensure(),
  patente: string().ensure(),
  latitud: string().ensure(),
  longitud: string().ensure(),
  linkMapa: string().ensure(),
  fechaTxt: string().ensure(),
  velocidadActual: string().ensure(),
});

const getMaybeValidEvento = (
  evento: EventoBackend
): Promise<EventoBackend | null> => {
  return schema
    .isValid(evento, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? evento : null));
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): EventoBackend[] => {
  try {
    const maybeMensaje = axiosResponse.data;

    return maybeMensaje instanceof Array ? maybeMensaje : [];
  } catch {
    return [];
  }
};

const parseEventos = (x: EventoBackend): evento => ({
  clienteId: x.clienteId,
  conductorId: x.conductorId,
  id: x.id,
  conductorNombre: x.conductorNombre,
  mensajeId: x.mensajeId,
  mensaje: x.mensaje,
  tituloMensaje: x.tituloMensaje,
  coordenadaId: x.coordenadaId,
  coordenadaNombre: x.coordenadaNombre,
  eventoId: x.eventoId,
  eventoNombre: x.eventoNombre,
  rutaId: x.rutaId,
  rutaNombre: x.rutaNombre,
  patente: x.patente,
  latitud: x.latitud,
  longitud: x.longitud,
  linkMapa: x.linkMapa,
  fechaTxt: x.fechaTxt,
  velocidadActual: x.velocidadActual,
});

export const fetchEventos = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Evento): Promise<Array<EventoBackend | null>> =>
        Promise.all(Evento.map(getMaybeValidEvento))
    )
    .then(request => request.filter(x => x))

    .then(request => request.map(parseEventos));
