import { AxiosPromise } from 'axios';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { ActividadesCorrectivas } from './Correctiva';
import { Correctiva } from '@/pantallas/Correctivas/Data/Correctiva';

type EditarCorrectivaHttpResponseBody = unknown;
export type EditarCorrectivaHttpRequestParams = {
  id?: number;
  vehiculoId: number;
  tallerId: number;
  nombre: string;
  responsable: number;
  fechaIngreso: string;
  fechaSalida: string;
  kilometraje: number;
  horasMotor: number;
  fechaRealizacion: string;
  actividadMants: ActividadesCorrectivas[];
  actividadeExtras: string;
  horasHombre: number;
  costoHH: number;
  costoInsum: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  mantenimientoCorrectivo: Correctiva
): AxiosPromise<EditarCorrectivaHttpResponseBody> => {
  const params: EditarCorrectivaHttpRequestParams = {
    id: mantenimientoCorrectivo.id,
    vehiculoId: mantenimientoCorrectivo.vehiculoId,
    tallerId: mantenimientoCorrectivo.taller,
    nombre: mantenimientoCorrectivo.nombre,
    responsable: mantenimientoCorrectivo.responsable,
    fechaIngreso: mantenimientoCorrectivo.fechaIngreso.format(),
    fechaSalida: mantenimientoCorrectivo.fechaSalida.format(),
    kilometraje: mantenimientoCorrectivo.kilometraje,
    horasMotor: mantenimientoCorrectivo.horasMotor,
    fechaRealizacion: mantenimientoCorrectivo.fechaRealizacion.format(),
    actividadMants: mantenimientoCorrectivo.actividades,
    actividadeExtras: mantenimientoCorrectivo.actividadesExtras,
    horasHombre: mantenimientoCorrectivo.horasHombre,
    costoHH: mantenimientoCorrectivo.costoHoraHombre,
    costoInsum: mantenimientoCorrectivo.costoInsumos,
  };
  return axios.http.put('MantenimientoCorrectivo', params);
};

export const editarMantenimientoCorrectivo = (correctiva: Correctiva) =>
  makeHttpRequest(correctiva);
