import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AxiosPromise } from 'axios';
import { MsResponseSolicitud } from './MisSolicitudesTypes';

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequestSolicitudes = (
  filters: any
): AxiosPromise<MsResponseSolicitud> => {
  return axios.http.post('Metabase/PostgenericA/track/getSolicitudes', filters);
};
export const misSolicitudesService = (filters: any) =>
  makeHttpRequestSolicitudes(filters).then(response => {
    return response.data;
  });

const makeHttpRequestSolicitudesListaDoc = (
  idCaso: string
): AxiosPromise<MsResponseSolicitud> => {
  return axios.http.post('Metabase/PostgenericA/track/getSolicitudesListaDoc', {
    id: idCaso,
  });
};
export const misSolicitudesListaDocService = (idCaso: string) =>
  makeHttpRequestSolicitudesListaDoc(idCaso).then(response => {
    return response;
  });

const makeHttpRequestSolicitudesObtenerEpc = (
  idCaso: string
): AxiosPromise<MsResponseSolicitud> => {
  return axios.http.post(
    'Metabase/PostgenericA/track/getSolicitudesObtenerEpc',
    { id: idCaso }
  );
};
export const misSolicitudesObtenerEpcService = (idCaso: string) =>
  makeHttpRequestSolicitudesObtenerEpc(idCaso).then(response => {
    return response.data;
  });

const makeHttpRequestSolicitudesArchivos = (
  idCaso: string
): AxiosPromise<MsResponseSolicitud> => {
  return axios.http.post('Metabase/PostgenericA/track/getSolicitudesArchivos', {
    id: idCaso,
  });
};
export const misSolicitudesArchivosService = (idCaso: string) =>
  makeHttpRequestSolicitudesArchivos(idCaso).then(response => {
    return response.data;
  });

const makeHttpRequestSolicitudesSubirDoc = (
  IdRegistro: string,
  titulo: string,
  Comentario: string,
  IdCuenta: string,
  fileName: string,
  file: any
): AxiosPromise<MsResponseSolicitud> => {
  return axios.http.post('Metabase/PostgenericA/track/subirDoc', {
    IdRegistro: IdRegistro,
    titulo: titulo,
    Comentario: Comentario,
    IdCuenta: IdCuenta,
    fileName: fileName,
    file: file,
  });
};
export const misSolicitudesSubirDocService = (
  IdRegistro: string,
  titulo: string,
  Comentario: string,
  IdCuenta: string,
  fileName: string,
  file: any
) =>
  makeHttpRequestSolicitudesSubirDoc(
    IdRegistro,
    titulo,
    Comentario,
    IdCuenta,
    fileName,
    file
  ).then(response => {
    return response.data;
  });

const makeHttpRequestSolicitudesDescargar = (
  idDoc: string
): AxiosPromise<MsResponseSolicitud> => {
  return axios.http.post('Metabase/PostgenericA/track/descargaDocSolicitudes', {
    id: idDoc,
  });
};
export const misSolicitudesDescargarService = (idDoc: string) =>
  makeHttpRequestSolicitudesDescargar(idDoc).then(response => {
    return response;
  });
