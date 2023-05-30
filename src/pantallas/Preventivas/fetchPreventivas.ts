import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { Preventiva } from '@/pantallas/Preventivas/Preventiva';
import moment from 'moment';
import config from '@/config/index';

type PreventivaBackend = {
  id: number;
  unidad: string;
  nombrePlanMantenimiento: string;
  estado: string;
  vehiculoMantenimientoId: number;
  tallerId: number;
  responsable: string;
  fechaIngreso: Date;
  fechaSalida: Date;
  kilometraje: number;
  horasMotor: number;
  fechaRealizacion: Date;
  mantenimientoPlanMantenimientoId: number;
  mantenimientoPautaActividadId: number;
  mantenimientoActividadMantId?: number[];
  actividadeExtras: string;
  horasHombre: number;
  costoHH: number;
  costoInsum: number;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
  nombreFlota: string;
  nombrePautaActividad: string;
  estadoPlanMantenimientoText: string;
};

type PreventivaHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (): AxiosPromise<PreventivaHttpResponseBody> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(`mantenimientopreventivo/grid2/${clienteId}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<PreventivaHttpResponseBody>
): PreventivaBackend[] => {
  try {
    const maybePreventiva = axiosResponse.data;
    return maybePreventiva instanceof Array ? maybePreventiva : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  unidad: string().ensure(),
  nombrePlanMantenimiento: string().ensure(),
  estado: string().ensure(),
  vehiculoMantenimientoId: string().ensure(),
  tallerId: string().ensure(),
  responsable: string().ensure(),
  fechaIngreso: string().ensure(),
  fechaSalida: string().ensure(),
  kilometraje: string().ensure(),
  horasMotor: string().ensure(),
  fechaRealizacion: string().ensure(),
  mantenimientoPlanMantenimientoId: string().ensure(),
  mantenimientoPautaActividadId: string().ensure(),
  mantenimientoActividadMantId: string().ensure(),
  actividadeExtras: string().ensure(),
  horasHombre: string().ensure(),
  costoHH: string().ensure(),
  costoInsum: string().ensure(),
  fechaModificacion: string().ensure(),
  usuarioModifica: string().ensure(),
  fechaCreacion: string().ensure(),
  usuarioCreador: string().ensure(),
  nombreFlota: string().ensure(),
  nombrePautaActividad: string().ensure(),
  estadoPlanMantenimientoText: string().ensure(),
});

const getMaybeValidPreventiva = (
  preventiva: PreventivaBackend
): Promise<PreventivaBackend | null> => {
  return schema
    .isValid(preventiva, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? preventiva : null));
};

const parsePreventiva = (x: PreventivaBackend): Preventiva => ({
  id: x.id,
  unidad: x.unidad,
  nombrePlanMantenimiento: x.nombrePlanMantenimiento,
  estado: x.estado,
  vehiculoMantenimientoId: x.vehiculoMantenimientoId,
  tallerId: x.tallerId,
  responsable: x.responsable,
  fechaIngreso: moment(x.fechaIngreso),
  fechaSalida: moment(x.fechaSalida),
  kilometraje: x.kilometraje,
  horasMotor: x.horasMotor,
  fechaRealizacion: moment(x.fechaRealizacion),
  mantenimientoPlanMantenimientoId: x.mantenimientoPlanMantenimientoId,
  mantenimientoPautaActividadId: x.mantenimientoPautaActividadId,
  mantenimientoActividadMantId: x.mantenimientoActividadMantId,
  actividadeExtras: x.actividadeExtras,
  horasHombre: x.horasHombre,
  costoHH: x.costoHH === null ? 0 : x.costoHH,
  costoInsum: x.costoInsum === null ? 0 : x.costoInsum,
  fechaModificacion: moment(x.fechaModificacion),
  usuarioModifica: x.usuarioModifica,
  fechaCreacion: moment(x.fechaCreacion),
  usuarioCreador: x.usuarioCreador,
  nombreFlota: x.nombreFlota,
  nombrePautaActividad: x.nombrePautaActividad,
  estadoPlanMantenimientoText: x.estadoPlanMantenimientoText,
});

export const fetchPreventivas = () =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (Preventiva): Promise<Array<PreventivaBackend | null>> =>
        Promise.all(Preventiva.map(getMaybeValidPreventiva))
    )
    .then(Preventiva => Preventiva.filter(x => x))
    .then(Preventiva => Preventiva.map(parsePreventiva));
