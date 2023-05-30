import { PreventivaNuevo } from '@/pantallas/Preventivas/Preventiva';

import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import moment from 'moment';

type EditarPreventivaHttpResponseBody = unknown;
export type EditarPreventivaHttpRequestParams = {
  id: number;
  vehiculoMantenimientoId: number;
  tallerId: number;
  responsable: string;
  fechaIngreso: moment.Moment;
  fechaSalida: moment.Moment;
  kilometraje: number;
  horasMotor: number;
  fechaRealizacion: moment.Moment;
  mantenimientoPlanMantenimientoId: number;
  mantenimientoPautaActividadId: number;
  mantenimientoActividadMantId: number[];
  actividadeExtras: string;
  horasHombre: number;
  costoHH: number;
  costoInsum: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  preventiva: PreventivaNuevo
): AxiosPromise<EditarPreventivaHttpResponseBody> => {
  const params: EditarPreventivaHttpRequestParams = {
    ...preventiva,
  };
  return axios.http.put('mantenimientopreventivo', params);
};

export const editarPreventiva = (preventiva: PreventivaNuevo) =>
  makeHttpRequest(preventiva);
