import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import {
  Correctiva,
  ActividadesCorrectivas,
} from '@/pantallas/Correctivas/Data/Correctiva';
import moment from 'moment';

type HttpRequestBody = {
  vehiculoId: number;
  tallerId: number;
  nombre: string;
  responsable: number;
  fechaIngreso: moment.Moment;
  fechaSalida: moment.Moment;
  kilometraje: number;
  horasMotor: number;
  fechaRealizacion: moment.Moment;
  actividadMants: ActividadesCorrectivas[];
  actividadeExtras: string;
  horasHombre: number;
  costoHH: number;
  costoInsum: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);
const makeHttpRequest = (
  mantenimientoCorrectivo: CreacionMantenimientoCorrectivo
): AxiosPromise<unknown> => {
  const body: HttpRequestBody = {
    vehiculoId: mantenimientoCorrectivo.vehiculoId,
    tallerId: mantenimientoCorrectivo.taller,
    nombre: mantenimientoCorrectivo.nombre,
    responsable: mantenimientoCorrectivo.responsable,
    fechaIngreso: mantenimientoCorrectivo.fechaIngreso,
    fechaSalida: mantenimientoCorrectivo.fechaSalida,
    kilometraje: mantenimientoCorrectivo.kilometraje,
    horasMotor: mantenimientoCorrectivo.horasMotor,
    fechaRealizacion: mantenimientoCorrectivo.fechaRealizacion,
    actividadMants: mantenimientoCorrectivo.actividades,
    actividadeExtras: mantenimientoCorrectivo.actividadesExtras,
    horasHombre: mantenimientoCorrectivo.horasHombre,
    costoHH: mantenimientoCorrectivo.costoHoraHombre,
    costoInsum: mantenimientoCorrectivo.costoInsumos,
  };
  return axios.http.post(`MantenimientoCorrectivo`, body);
};

export interface CreacionMantenimientoCorrectivo
  extends Pick<Correctiva, Exclude<keyof Correctiva, 'id'>> {}

export const crearMantenimientoCorrectivo = (
  mantenimientoCorrectivo: CreacionMantenimientoCorrectivo
) => makeHttpRequest(mantenimientoCorrectivo);
