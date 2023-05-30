import { array, object, string } from 'yup';
import { AxiosPromise, AxiosResponse } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import moment from 'moment';
import {
  Calendario,
  CalendarioNuevoForm,
} from '@/pantallas/Calendarios/Calendario';
import config from '@/config/index';

type CalendarioBackend = {
  id?: Calendario['id'];
  nombreCalendario: Calendario['nombreCalendario'];
  estado: Calendario['estado'];
  diaria?: boolean;
  semanaLaboral?: boolean;
  semanal?: boolean;
  mensual?: boolean;
  anual?: boolean;
  fechaInicio?: Date;
  fechaFin?: Date;
  multiploDias?: number;
  multiploSemanas?: number;
  multiploMes?: number;
  multiploAnios?: number;
  repeticiones?: number;
  sinFechaFin?: boolean;
  numeroSemana?: number;

  calendarioMes?: Mes[];
  calendarioDiasMes?: DiaDelMes[];
  calendarioDiasSemana?: DiaDeLaSemana[];
  totalAsociados: number;

  //Log
  usuarioCreador?: string;
  usuarioModifica?: string;
  fechaCreacion?: moment.Moment;
  fechaModificacion?: moment.Moment;
  estadoTxt?: string;
};

type CalendarioHttpResponseBody = unknown;

const axios = new AxiosVue(ServicioProxy.Calendario);

const makeHttpRequest = (): AxiosPromise<CalendarioHttpResponseBody> => {
  const clienteId = config.getClienteSesion();
  return axios.http.get(`Calendario/grid2/${clienteId}`);
};

const getResponseData = (
  axiosResponse: AxiosResponse<CalendarioHttpResponseBody>
): CalendarioBackend[] => {
  try {
    const maybeCalendarios = axiosResponse.data;
    return maybeCalendarios instanceof Array ? maybeCalendarios : [];
  } catch {
    return [];
  }
};

const schema = object({
  id: string().ensure(),
  nombreCalendario: string().ensure(),

  usuarioCreador: string().ensure(),
  usuarioModifica: string().ensure(),
  fechaCreacion: string().ensure(),
  fechaModificacion: string().ensure(),
  estado: string().ensure(),
  estadoTxt: string().ensure(),
  totalAsociados: string().ensure(),
});

const getMaybeValidCalendario = (
  calendario: CalendarioBackend
): Promise<CalendarioBackend | null> => {
  return schema
    .isValid(calendario, {
      strict: false,
      stripUnknown: true,
    })
    .then(valid => (valid ? calendario : null));
};

const parseCalendario = (x: CalendarioBackend): CalendarioNuevoForm => ({
  id: x.id,
  nombreCalendario: x.nombreCalendario,
  usuarioCreador: x.usuarioCreador,
  usuarioModifica: x.usuarioModifica === null ? '' : x.usuarioModifica,
  fechaCreacion: moment(x.fechaCreacion),
  fechaModificacion: moment(x.fechaModificacion),
  estado: x.estado,
  totalAsociados: x.totalAsociados,
  estadoTxt: x.estadoTxt,
  fechaInicio: moment(x.fechaInicio),
  ...(x.fechaFin && {
    fechaFin: moment(x.fechaFin),
    radioFechaFin: 0,
  }),
  ...((x.repeticiones != null || x.repeticiones > 0) && {
    radioFechaFin: 1,
    numRepeticiones: x.repeticiones,
  }),
  ...(x.sinFechaFin && {
    radioFechaFin: 2,
  }),
  ...(x.diaria && {
    frecuenciaSeleccionada: 0,
    diariaCantidadDiasRadio: !x.multiploDias ? 1 : 0,
    diariaNumDias:
      !x.multiploDias || x.multiploDias > 0 ? x.multiploDias : null,
  }),
  ...(x.semanal && {
    frecuenciaSeleccionada: 1,
    semanalCantidadSemanas: x.multiploSemanas,
    semanalDiasSemana: x.calendarioDiasSemana.map(dia => dia.nroDiaSemana),
  }),
  ...(x.mensual && {
    frecuenciaSeleccionada: 2,
    ...(x.numeroSemana > 0
      ? {
          mensualDiaSemanaNum: x.numeroSemana,
          mensualDiaSemanaNombre:
            x.calendarioDiasSemana.length > 0
              ? x.calendarioDiasSemana[0].nroDiaSemana
              : null,
          mensualRadio: 1,
          mensualNumMeses: x.multiploMes,
        }
      : {
          mensualCantMeses: x.multiploMes,
          mensualDiaMes:
            x.calendarioDiasMes.length > 0
              ? x.calendarioDiasMes[0].nroDiaMes
              : null,
          mensualRadio: 0,
        }),
  }),
  ...(x.anual && {
    frecuenciaSeleccionada: 3,
    anualCantAnios: x.multiploAnios,
    anualNumDiaMes:
      x.calendarioDiasMes.length > 0 ? x.calendarioDiasMes[0].nroDiaMes : null,
    anualCantMeses: x.multiploMes,
  }),
});

export const fetchCalendarios = (): Promise<CalendarioNuevoForm[]> =>
  makeHttpRequest()
    .then(getResponseData)
    .then(
      (calendarios): Promise<Array<CalendarioBackend | null>> =>
        Promise.all(calendarios.map(getMaybeValidCalendario))
    )
    .then(calendarios => calendarios.filter(x => x))
    .then(calendarios => calendarios.map(parseCalendario));

export type Mes = {
  idCalendario?: number;
  nroMes?: number;
};

export type DiaDelMes = {
  idCalendario?: number;
  nroDiaMes?: number;
};

export type DiaDeLaSemana = {
  idCalendario: number;
  nroDiaSemana: number;
};
