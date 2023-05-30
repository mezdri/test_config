import {
  PlanMantenimientoDetalle,
  PautasPlanesMantenimiento,
  VehiculosPlanesMantenimiento,
} from './PlanMantenimiento';
import { TipoFrecuencias } from '@/config/enums';
import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';
import { PlanMantenimiento } from './PlanMantenimiento';

type PlanMantenimientoDetalleBackend = {
  id: number;
  nombre: string;
  estadoTxt: string;
  estado: number;
  tipoMantenimientoId: number;
  pautaActividaMants: PautasPlanesMantenimiento[];
  vehiculos: VehiculosPlanesMantenimiento[];
  notificaGps: boolean;
  notificaBrowser: boolean;
  notificaEmail: boolean;
};

type PlanesMantenimientoHttpResponseBody = PlanMantenimientoDetalleBackend;
export type FetchPlanesMantenimientoHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  idPlan: number
): AxiosPromise<PlanesMantenimientoHttpResponseBody> => {
  const body: FetchPlanesMantenimientoHttpRequestBody = {
    clienteId: config.getClienteSesion(),
    usuarioId: store.state.userId,
  };
  return axios.http.get(`PlanMantenimiento/${idPlan}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<PlanesMantenimientoHttpResponseBody>
): PlanMantenimientoDetalleBackend => {
  try {
    const maybePlanesMantenimiento = axiosResponse.data;
    return maybePlanesMantenimiento;
  } catch {
    return;
  }
};

const schema = object({});

const getMaybeValidRecepcion = (
  planMantenimiento: PlanMantenimientoDetalleBackend
): Promise<PlanMantenimientoDetalleBackend | null> => {
  return schema
    .isValid(planMantenimiento, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? planMantenimiento : null));
};

const getTipoById = (id: number) => {
  switch (id) {
    case 0:
      return 'Preventiva';
    case 1:
      return 'Correctiva';
    default:
      return 'Preventiva';
  }
};

const getFrecuenciaById = (id: number) => {
  switch (id) {
    case TipoFrecuencias.Dias:
      return 'Dias';
    case TipoFrecuencias.Semanas:
      return 'Semanas';
    case TipoFrecuencias.Meses:
      return 'Meses';
    default:
      return 'Dias';
  }
};

const parsePlanMantenimiento = (
  x: PlanMantenimientoDetalleBackend
): PlanMantenimientoDetalle => ({
  id: x.id,
  nombre: x.nombre,
  tipoMantenimientoId: x.tipoMantenimientoId,
  tipoMantenimientoNomb: getTipoById(x.tipoMantenimientoId),
  pautas: x.pautaActividaMants.map(pauta => ({
    ...pauta,
    frecuenciaTipoNombre: getFrecuenciaById(pauta.tipoFrecuencia),
  })),
  vehiculos: x.vehiculos,
  notificaGps: x.notificaGps,
  notificaBrowser: x.notificaBrowser,
  notificaEmail: x.notificaEmail,
});

export const fetchPlanesMantenimientoDetalle = (idPlan: number) =>
  makeHttpRequest(idPlan)
    .then(getResponseData)
    .then(getMaybeValidRecepcion)
    .then(parsePlanMantenimiento);
