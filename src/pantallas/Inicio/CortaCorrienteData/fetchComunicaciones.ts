import moment from 'moment';
import axios, { AxiosPromise, AxiosResponse, Cancel, Canceler } from 'axios';
import { object, number, boolean, string } from 'yup';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type ComunicacionBackend = {
  id: string; //"101156800"
  plataformaId: number; // 20,
  vehiculoId: number; //"2019-11-14T15:33:10",
  gpsId: number;
  imei: any;
  tipoSolicitudId: number;
  tipoMensajeId: number;
  fechaSolicitud: string;
  estadoId: number;
  usuarioId: number;
  detalleError: string;
  mensaje: string;
  mensajeRecibidoPlataformaId: number;
  fechaRespuesta: string;
  estadoTxt: string;
  solicitudTxt: string;
  usuarioTxt: string;
  fechaSolicitudTxt: string;
  mensajeTxt: string;
  fechaRespuestaTxt: string;
};

export type Comunicacion = {
  id: string; //"101156800"
  plataformaId: number; // 20,
  vehiculoId: number; //"2019-11-14T15:33:10",
  gpsId: number;
  imei: any;
  tipoSolicitudId: number;
  tipoMensajeId: number;
  fechaSolicitud: string;
  estadoId: number;
  usuarioId: number;
  detalleError: string;
  mensaje: string;
  mensajeRecibidoPlataformaId: number;
  fechaRespuesta: string;
  estadoTxt: string;
  solicitudTxt: string;
  usuarioTxt: string;
  fechaSolicitudTxt: string;
  mensajeTxt: string;
  fechaRespuestaTxt: string;
};

export type ComunicacionHttpResponseBody = {
  data?: unknown;
};
export type FetchCanceler = () => void;
type CancelExecutor = (cancelFetch: FetchCanceler) => void;

const axiosVue = new AxiosVue(ServicioProxy.Vehiculo);

const makeHttpRequest = (
  vehiculoId: number,
  cancelExecutor?: CancelExecutor
): AxiosPromise<ComunicacionHttpResponseBody> => {
  return axiosVue.http.get(`cortaCorriente/${vehiculoId}/GetComunicacion`, {
    cancelToken: cancelExecutor && new axios.CancelToken(cancelExecutor),
  });
};

const responseComunicacionBackend = (
  axiosResponse: AxiosResponse<ComunicacionHttpResponseBody>
): ComunicacionBackend[] => {
  let comunicacion: unknown;
  try {
    comunicacion = axiosResponse.data;
  } catch {
    comunicacion = [];
  }
  return comunicacion instanceof Array ? comunicacion : [];
};

const schema = object({
  // id: string().required(),
  //nombreConductor: string().ensure(),
  // unidad: string().ensure(),
  // latitud: number(),
  // longitud: number(),
  // transmitiendo: boolean(),
  // ubicacion: string().ensure(),
});

const getMaybeValidComunicacion = (
  comunicacion: ComunicacionBackend
): Promise<ComunicacionBackend | null> => {
  return schema
    .isValid(comunicacion)
    .then(valid => (valid ? comunicacion : null));
};

const parseComunicacion = (x: ComunicacionBackend): Comunicacion => {
  return {
    id: x.id,
    plataformaId: x.plataformaId,
    vehiculoId: x.vehiculoId,
    gpsId: x.gpsId,
    imei: x.imei,
    tipoSolicitudId: x.tipoSolicitudId,
    tipoMensajeId: x.tipoMensajeId,
    fechaSolicitud: x.fechaSolicitud,
    estadoId: x.estadoId,
    usuarioId: x.usuarioId,
    detalleError: x.detalleError,
    mensaje: x.mensaje,
    mensajeRecibidoPlataformaId: x.mensajeRecibidoPlataformaId,
    fechaRespuesta: x.fechaRespuesta,
    estadoTxt: x.estadoTxt,
    solicitudTxt: x.solicitudTxt,
    usuarioTxt: x.usuarioTxt,
    fechaSolicitudTxt: x.fechaSolicitudTxt,
    mensajeTxt: x.mensajeTxt,
    fechaRespuestaTxt: x.fechaRespuestaTxt,
  };
};

export const fetchComunicaciones = (
  vehiculoId: number,
  cancelExecutor?: CancelExecutor
): Promise<Comunicacion[]> =>
  makeHttpRequest(vehiculoId, cancelExecutor)
    .then(responseComunicacionBackend)
    .then(
      (comunicaciones): Promise<Array<ComunicacionBackend | null>> =>
        Promise.all(comunicaciones.map(getMaybeValidComunicacion))
    )
    .then(comunicaciones => comunicaciones.filter(x => x))
    .then(comunicaciones => comunicaciones.map(parseComunicacion));
