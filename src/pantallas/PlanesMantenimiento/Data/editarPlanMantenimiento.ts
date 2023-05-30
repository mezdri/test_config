import { BooleanAsNumber } from '@/reusable/Data/dataUtils';
import {
  PlanMantenimientoNueva,
  PlanMantenimientoAsociacion,
  PautasPlanesMantenimiento,
  NotificacionPlanMantenimiento,
} from './PlanMantenimiento';
import { AxiosPromise } from 'axios';
import { omit } from 'lodash';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { editarNotificacion } from './editarNotificacion';

type EditarPlanMantenimientoHttpResponseBody = unknown;
export type EditarPlanMantenimientoHttpRequestParams = {
  id: number;
  nombre: string;
  tipoMantenimientoId: number;
  pautaActividadMants: PautasPlanesMantenimiento[];
  notificaGps: boolean;
  notificaBrowser: boolean;
  notificaEmail: boolean;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  PlanMantenimiento: PlanMantenimientoAsociacion
): AxiosPromise<EditarPlanMantenimientoHttpResponseBody> => {
  const params: EditarPlanMantenimientoHttpRequestParams = {
    ...omit(PlanMantenimiento, ['pautas']),
    id: PlanMantenimiento.id,
    nombre: PlanMantenimiento.nombre,
    tipoMantenimientoId: PlanMantenimiento.tipoMantenimientoId,
    pautaActividadMants: PlanMantenimiento.pautas,
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
  return axios.http.put('PlanMantenimiento', params);
};

const makeNotificacion = (
  planMantenimiento: PlanMantenimientoAsociacion
): NotificacionPlanMantenimiento => {
  return {
    id: planMantenimiento.idNotificacion,
    idPlan: planMantenimiento.id,
    contactos: planMantenimiento.contactos,
    listaDistribuciones: planMantenimiento.listasDistribucion,
    usuarios: planMantenimiento.usuarios,
    calendarios: planMantenimiento.calendarios,
  };
};

const parse = (planMantenimiento: PlanMantenimientoAsociacion) => (
  x: EditarPlanMantenimientoHttpResponseBody
) => makeNotificacion(planMantenimiento);

export const editarPlanMantenimiento = (
  planMantenimiento: PlanMantenimientoAsociacion
) =>
  makeHttpRequest(planMantenimiento)
    .then(parse(planMantenimiento))
    .then(editarNotificacion);
