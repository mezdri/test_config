import { BooleanAsNumber } from '@/reusable/Data/dataUtils';
import {
  PlanMantenimientoNueva,
  PlanMantenimientoAsociacion,
  PautasPlanesMantenimiento,
  VehiculosPlanesMantenimiento,
  NotificacionPlanMantenimiento,
} from './PlanMantenimiento';
import { AxiosPromise, AxiosResponse } from 'axios';
import { omit } from 'lodash';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { string, object, number } from 'yup';
import { crearNotificacion } from './crearNotificacion';

type CrearPlanMantenimientoHttpResponseBody = {
  id: number;
  nombre: string;
  estado: number;
  tipoMantenimientoId: number;
};
type CrearPlanMantenimientoHttpRequestParams = {
  nombre: string;
  tipoMantenimientoId: number;
  pautaActividadMants: PautasPlanesMantenimiento[];
  vehiculos: VehiculosPlanesMantenimiento[];
  notificaGps: boolean;
  notificaBrowser: boolean;
  notificaEmail: boolean;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  PlanMantenimiento: PlanMantenimientoAsociacion
): AxiosPromise<CrearPlanMantenimientoHttpResponseBody> => {
  const params: CrearPlanMantenimientoHttpRequestParams = {
    ...omit(PlanMantenimiento, ['pautas']),
    nombre: PlanMantenimiento.nombre,
    tipoMantenimientoId: PlanMantenimiento.tipoMantenimientoId,
    pautaActividadMants: PlanMantenimiento.pautas,
    vehiculos: PlanMantenimiento.vehiculos,
    notificaGps: PlanMantenimiento.medioNotificacion.find(x => x === 1)
      ? true
      : false,
    notificaBrowser: PlanMantenimiento.medioNotificacion.find(x => x === 2)
      ? true
      : false,
    notificaEmail: PlanMantenimiento.medioNotificacion.find(x => x === 3)
      ? true
      : false,
  };
  return axios.http.post('PlanMantenimiento', params);
};

const getResponseData = (
  axiosResponse: AxiosResponse<CrearPlanMantenimientoHttpResponseBody>
): CrearPlanMantenimientoHttpResponseBody => axiosResponse.data;

const schema = object({
  id: number(),
});

const getMaybeValidData = (
  response: CrearPlanMantenimientoHttpResponseBody
): Promise<CrearPlanMantenimientoHttpResponseBody | null> => {
  return schema
    .isValid(response, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? response : null));
};

const makeNotificacion = (
  planMantenimiento: PlanMantenimientoAsociacion,
  idPlan: number
): NotificacionPlanMantenimiento => {
  return {
    idPlan: idPlan,
    contactos: planMantenimiento.contactos,
    listaDistribuciones: planMantenimiento.listasDistribucion,
    usuarios: planMantenimiento.usuarios,
    calendarios: planMantenimiento.calendarios,
  };
};

const parse = (planMantenimiento: PlanMantenimientoAsociacion) => (
  x: CrearPlanMantenimientoHttpResponseBody
) => makeNotificacion(planMantenimiento, x.id);

export const crearPlanMantenimiento = (
  planMantenimiento: PlanMantenimientoAsociacion
) =>
  makeHttpRequest(planMantenimiento)
    .then(getResponseData)
    .then(getMaybeValidData)
    .then(parse(planMantenimiento))
    .then(crearNotificacion);
