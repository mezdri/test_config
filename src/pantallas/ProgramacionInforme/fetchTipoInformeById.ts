import { array, number, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import moment from 'moment';

export type IInformeProgramadoBackend = {
  id?: number;
  nombre?: string;
  estado?: number;
  formato?: number;
  ultimoEnvio?: moment.Moment;
  estadoEnvio?: number;
  detalleError?: string;
  tipoInformeId?: number;
  vehiculos?: vehiculosBackend[];
  zonas?: zonasBackend[];
  periodo?: ReportePeriodoBackend;
  notificaBrowser?: boolean;
  notificaGps?: boolean;
  notificaEmail?: boolean;
  filtros?: FiltrosBackend[];
  actividades?: actividadBackend[];
  planMantenimientos?: planMantenimientoBackend[];
  descargas?: descargaBackend[];
  proveedores?: proveedorBackend[];
  clienteProveedores?: clienteProveedorBackend[];
  filtrosAdicionales?: any;
  semaforo?: any;
};

export type vehiculosBackend = {
  id?: number;
  vehiculoId?: number;
  estado?: number;
  patente?: string;
};

export type zonasBackend = {
  id?: number;
  gpsCoordenada?: number;
  estado?: number;
};

type ReportePeriodoBackend = {
  id?: number;
  horaDesde?: string;
  horaHasta?: string;
  periodoDesde?: moment.Moment;
  periodoHasta?: moment.Moment;
  tipo?: number;
  multiploDias?: number;
  multiploSemanas?: number;
  multiploMes?: number;
  estado?: number;
};

export type FiltrosBackend = {
  id?: number;
  reporteFiltroId?: number;
  value?: string;
  estado?: number;
};

export type actividadBackend = {
  id?: number;
  actividadTipoId?: number;
  estado?: number;
};

export type planMantenimientoBackend = {
  id?: number;
  planMantenimientoId?: number;
  estado?: number;
};

export type descargaBackend = {
  id?: number;
  descargaId?: number;
  estado?: number;
  nombre?: string;
  proveedorNombre?: string;
  clienteProveedorNombre?: string;
};

export type proveedorBackend = {
  id?: number;
  proveedorId?: number;
  estado?: number;
  nombre?: string;
};

export type clienteProveedorBackend = {
  id?: number;
  clienteProveedorId?: number;
  estado?: number;
  nombre?: string;
};

type HttpResponseBody = IInformeProgramadoBackend;

const axios = new AxiosVue(ServicioProxy.Metabase);

const makeHttpRequest = (
  idInformeProgramado: number
): AxiosPromise<HttpResponseBody> => {
  return axios.http.get(`InformeProgramado/${idInformeProgramado}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<HttpResponseBody>
): IInformeProgramadoBackend => {
  try {
    const maybeProgramacionInforme = axiosResponse.data;
    return maybeProgramacionInforme;
  } catch {
    return null;
  }
};

const schema = object({
  id: string().ensure(),
  nombre: string().ensure(),
  estado: string().ensure(),
  formato: string().ensure(),
  ultimoEnvio: string().ensure(),
  estadoEnvio: string().ensure(),
  detalleError: string().ensure(),
  tipoInformeId: string().ensure(),
  vehiculos: array(
    object({
      id: string().ensure(),
      vehiculoId: string().ensure(),
      estado: string().ensure(),
      patente: string().ensure(),
    })
  ),
  zonas: array(
    object({
      id: string().ensure(),
      gpsCoordenada: string().ensure(),
      estado: string().ensure(),
    })
  ),
  periodo: object({
    id: string().ensure(),
    horaDesde: string().ensure(),
    horaHasta: string().ensure(),
    periodoDesde: string().ensure(),
    periodoHasta: string().ensure(),
    tipo: string().ensure(),
    multiploDias: string().ensure(),
    multiploSemanas: string().ensure(),
    multiploMes: string().ensure(),
    estado: string().ensure(),
  }),
  notificaBrowser: string().ensure(),
  notificaGps: string().ensure(),
  notificaEmail: string().ensure(),
  filtros: array(
    object({
      id: string().ensure(),
      reporteFiltroId: string().ensure(),
      value: string().ensure(),
      estado: string().ensure(),
    })
  ),
  actividades: array(
    object({
      id: string().ensure(),
      actividadTipoId: string().ensure(),
      estado: string().ensure(),
    })
  ),
  planMantenimientos: array(
    object({
      id: string().ensure(),
      planMantenimientoId: string().ensure(),
      estado: string().ensure(),
    })
  ),
  descargas: array(
    object({
      id: string().ensure(),
      descargaId: string().ensure(),
      estado: string().ensure(),
      nombre: string().ensure(),
      proveedorNombre: string().ensure(),
      clienteProveedorNombre: string().ensure(),
    })
  ),
  proveedores: array(
    object({
      id: string().ensure(),
      proveedorId: string().ensure(),
      estado: string().ensure(),
      nombre: string().ensure(),
    })
  ),
  clienteProveedores: array(
    object({
      id: string().ensure(),
      clienteProveedorId: string().ensure(),
      estado: string().ensure(),
      nombre: string().ensure(),
    })
  ),
});

const getMaybeValidInformeProgramado = (
  informeProgramado: IInformeProgramadoBackend
): Promise<IInformeProgramadoBackend | null> => {
  return schema
    .isValid(informeProgramado, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? informeProgramado : null));
};

const parseProgramacionInforme = (
  x: IInformeProgramadoBackend
): IInformeProgramadoBackend => ({
  id: x.id,
  nombre: x.nombre,
  estado: x.estado,
  formato: x.formato,
  ultimoEnvio: moment(x.ultimoEnvio),
  estadoEnvio: x.estadoEnvio,
  detalleError: x.detalleError,
  tipoInformeId: x.tipoInformeId,
  vehiculos: x.vehiculos,
  zonas: x.zonas,
  periodo: x.periodo,
  notificaBrowser: x.notificaBrowser,
  notificaGps: x.notificaGps,
  notificaEmail: x.notificaEmail,
  filtros: x.filtros,
  filtrosAdicionales: x.filtrosAdicionales,
  actividades: x.actividades,
  planMantenimientos: x.planMantenimientos,
  descargas: x.descargas,
  proveedores: x.proveedores,
  clienteProveedores: x.clienteProveedores,
});

export const fetchInformeProgramado = (idInformeProgramado: number) =>
  makeHttpRequest(idInformeProgramado)
    .then(getResponseData)
    .then(getMaybeValidInformeProgramado)
    .then(parseProgramacionInforme);
