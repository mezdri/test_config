import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';
import moment from 'moment';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '@/config/index';
import store from '@/store';
import { PlanMantenimiento } from './PlanMantenimiento';

type PlanMantenimientoBackend = {
  id: number;
  nombre: string;
  numVehiculos: number;
  fechaModificacion: moment.Moment;
  usuarioModificacion: string;
  fechaCreacion: moment.Moment;
  usuarioCreacion: string;
  estadoTxt: string;
  estado: number;
  tipoMantenimientoId: number;
  totalAsociados: number;
  tipomantenimientotTxt: string;
};

export type IPlaneMantenimiento = {
  id?: number;
  nombre?: string;
};

type PlanesMantenimientoHttpResponseBody = unknown;
export type FetchPlanesMantenimientoHttpRequestBody = {
  clienteId: number;
  usuarioId: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<
  PlanesMantenimientoHttpResponseBody
> => {
  const body: FetchPlanesMantenimientoHttpRequestBody = {
    clienteId: config.getClienteSesion(),
    usuarioId: store.state.userId,
  };
  return axios.http.get('PlanMantenimiento');
};

const getResponseData = (
  axiosResponse: AxiosResponse<PlanesMantenimientoHttpResponseBody>
): PlanMantenimientoBackend[] => {
  try {
    const maybePlanesMantenimiento = axiosResponse.data;
    return maybePlanesMantenimiento instanceof Array
      ? maybePlanesMantenimiento
      : [];
  } catch {
    return [];
  }
};

const schema = object({});

const getMaybeValidRecepcion = (
  planMantenimiento: PlanMantenimientoBackend
): Promise<PlanMantenimientoBackend | null> => {
  return schema
    .isValid(planMantenimiento, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? planMantenimiento : null));
};

const parsePlanMantenimiento = (
  x: PlanMantenimientoBackend
): PlanMantenimiento => ({
  id: x.id,
  nombre: x.nombre,
  cantVehiculos: x.numVehiculos,
  fechaModificacion: moment(x.fechaModificacion),
  usuarioModificacion:
    x.usuarioModificacion === null ? '' : x.usuarioModificacion,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioCreacion: x.usuarioCreacion === null ? '' : x.usuarioCreacion,
  estado: x.estado === 1,
  estadoTxt: x.estadoTxt,
  totalAsociados: x.totalAsociados,
  tipomantenimientotTxt: x.tipomantenimientotTxt,
  tipoMantenimientoId: x.tipoMantenimientoId,
  tipoMantenimientoNomb:
    x.tipoMantenimientoId === 0 ? 'Preventivo' : 'Correctivo',
});

export const fetchPlanesMantenimiento = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (PlanesMantenimiento): Promise<Array<PlanMantenimientoBackend | null>> =>
        Promise.all(PlanesMantenimiento.map(getMaybeValidRecepcion))
    )
    .then(PlanesMantenimiento => PlanesMantenimiento.filter(x => x))
    .then(PlanesMantenimiento =>
      PlanesMantenimiento.map(parsePlanMantenimiento)
    );
