import { PautasPlanesMantenimiento } from '@/pantallas/PlanesMantenimiento/Data/PlanMantenimiento';
import { PautaActividadesMantenimiento } from './../ActividadesMantenimiento/ActividadMantenimiento';
import { BooleanAsNumber } from '@/reusable/Data/dataUtils';
import {
  PautaActividadNueva,
  PautaActividadAsociacion,
} from './PautaActividad';
import { AxiosPromise } from 'axios';
import { omit } from 'lodash';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

type CrearPautaActividadHttpResponseBody = unknown;
export type CrearPautaActividadHttpRequestParams = {
  nombrePauta: string;
  descripcion: string;
  estado: number;
  actividadMants: PautaActividadesMantenimiento[];
  planMantenimientos: PautasPlanesMantenimiento[];
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  pautaActividad: PautaActividadAsociacion
): AxiosPromise<CrearPautaActividadHttpResponseBody> => {
  const params: CrearPautaActividadHttpRequestParams = {
    ...omit(pautaActividad, ['actividades', 'planes']),
    estado: pautaActividad.estado.id,
    actividadMants: pautaActividad.actividades,
    planMantenimientos: pautaActividad.planes,
  };
  return axios.http.post('PautaActividad', params);
};

export const crearPautaActividad = (pautaActividad: PautaActividadAsociacion) =>
  makeHttpRequest(pautaActividad);
