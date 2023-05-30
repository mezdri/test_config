import { PreventivaNuevo } from '@/pantallas/Preventivas/Preventiva';
import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import moment from 'moment';
import config from '@/config/index';

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
  clienteId: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  preventiva: PreventivaNuevo
): AxiosPromise<EditarPreventivaHttpRequestParams> => {
  const params: EditarPreventivaHttpRequestParams = {
    ...preventiva,
    clienteId: config.getClienteSesion(),
  };
  return axios.http.put('mantenimientopreventivo', params);
};

export const editarPreventiva = (preventiva: PreventivaNuevo) =>
  makeHttpRequest(preventiva);
