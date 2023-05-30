import { object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import moment from 'moment';

type HistoricoPreventivoResponse = {
  data: HistoricoPreventivoBackend;
};

type HistoricoPreventivoBackend = {
  query: HistoricosPreventivoList[];
  totPrev: number;
  totalPrevCorr: number;
};

const axios = new AxiosVue(ServicioProxy.Mantenimiento);

const makeHttpRequest = (
  idVehiculo: number
): AxiosPromise<HistoricoPreventivoResponse> => {
  return axios.http.get(
    `MantenimientoPreventivoHistorico/VehiculoMant/${idVehiculo}`
  );
};

const getResponseData = (
  axiosResponse: AxiosResponse<HistoricoPreventivoResponse>
): HistoricoPreventivoResponse => {
  try {
    const maybeCorrectivas = axiosResponse.data;
    return maybeCorrectivas;
  } catch {
    return;
  }
};

const schema = object({});

const getMaybeValidPreventivos = (
  preventivo: HistoricoPreventivoResponse
): Promise<HistoricoPreventivoResponse | null> => {
  return schema
    .isValid(preventivo, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? preventivo : null));
};

const parsePreventiva = (
  x: HistoricoPreventivoResponse
): HistoricoPreventivo => {
  return {
    preventivosHistoricos: x.data.query.map(q => ({
      idPlanMantenimiento: q.idPlanMantenimiento,
      idMantenimiento: q.idMantenimiento,
      vehiculoId: q.vehiculoId,
      tipoPlanMantenimientoId: q.tipoPlanMantenimientoId,
      tipoMantenimientoText: q.tipoMantenimientoText,
      planMantenimientoId: q.planMantenimientoId,
      planMantenimientoText: q.planMantenimientoText,
      pautaActividadMantId: q.pautaActividadMantId,
      pautaActividadMantText: q.pautaActividadMantText,
      planMantenimientoEstado: q.planMantenimientoEstado,
      planMantenimientoEstadoText: q.planMantenimientoEstadoText,
      planiKilometraje: q.planiKilometraje,
      planiHoraMotor: q.planiHoraMotor,
      planiTiempo: q.planiTiempo,
      kilometraje: q.kilometraje,
      horaMotor: q.horaMotor,
      fechaRealizacion: moment(q.fechaRealizacion),
      horasHombre: q.horasHombre,
      costoHH: q.costoHH,
      taller: q.taller,
      responsable: q.responsable,
      fechaIngreso: moment(q.fechaIngreso),
      fechaSalida: moment(q.fechaSalida),
      actividadeExtras: q.actividadeExtras,
      listaActividades: q.listaActividades.map(h => ({
        id: h.id,
        tipoActividadMantText: h.tipoActividadMantText,
        nombreActividad: h.nombreActividad,
        estado: h.estado,
      })),
    })),
    totPrev: x.data.totPrev,
    totalPrevCorr: x.data.totalPrevCorr,
  };
};

export const fetchHistoricosPreventivo = (idVehiculo: number) =>
  makeHttpRequest(idVehiculo)
    .then(getResponseData)
    .then(getMaybeValidPreventivos)
    .then(parsePreventiva);

export type HistoricoPreventivo = {
  preventivosHistoricos: HistoricosPreventivoList[];
  totPrev: number;
  totalPrevCorr: number;
};

export type HistoricosPreventivoList = {
  idPlanMantenimiento: number;
  idMantenimiento: number;
  vehiculoId: number;
  tipoPlanMantenimientoId: number;
  tipoMantenimientoText: string;
  planMantenimientoId: number;
  planMantenimientoText: string;
  pautaActividadMantId: number;
  pautaActividadMantText?: string;
  planMantenimientoEstado?: null;
  planMantenimientoEstadoText: string;
  planiKilometraje: number;
  planiHoraMotor: number;
  planiTiempo: number;
  kilometraje: number;
  horaMotor: number;
  fechaRealizacion: moment.Moment;
  horasHombre: number;
  costoHH: number;
  taller: string;
  responsable: string;
  fechaIngreso: moment.Moment;
  fechaSalida: moment.Moment;
  listaActividades: Actividad[];
  actividadeExtras: string;
};

export type Actividad = {
  id: number;
  tipoActividadMantText: string;
  nombreActividad: string;
  estado: string;
};
