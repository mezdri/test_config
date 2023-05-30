import { BooleanAsNumber } from './../../reusable/Data/dataUtils';
import { CalendarioNuevoForm } from '@/pantallas/Calendarios/Calendario';
import { TipoFrecuenciasCalendario } from '@/config/enums';
import { AxiosPromise } from 'axios';

import { AxiosVue } from '@/AxiosVue';
import config from '@/config/index';
import { ServicioProxy } from '@/config/enums';

type CrearCalendarioHttpResponseBody = unknown;
export type CrearCalendarioHttpRequestParams = {
  estado: BooleanAsNumber; //
  nombreCalendario: string; //
  id?: number;
  diaria?: boolean;
  semanaLaboral?: boolean;
  semanal?: boolean;
  mensual?: boolean;
  anual?: boolean;
  fechaInicio?: Date; //
  fechaFin?: Date;
  multiploDias?: number;
  multiploSemanas?: number;
  multiploMes?: number;
  multiploAnios?: number;
  repeticiones?: number;
  sinFechaFin?: boolean;
  numeroSemana?: number;

  calendarioMes?: Mes[];
  calendarioDiasMes?: diaDelMes[];
  CalendarioDiasSemana?: diaDeLaSemana[];
  clienteId: number; //
};

const axios = new AxiosVue(ServicioProxy.Calendario);

const makeHttpRequest = (
  calendario: CalendarioNuevoForm
): AxiosPromise<CrearCalendarioHttpResponseBody> => {
  let params: CrearCalendarioHttpRequestParams = {
    estado: calendario.estado ? 1 : 0,
    clienteId: config.getClienteSesion(),
    nombreCalendario: calendario.nombreCalendario,
    fechaInicio: calendario.fechaInicio.toDate(),
  };

  params = returnDefault(params);

  if (calendario.radioFechaFin == 0) {
    params.fechaFin = calendario.fechaFin ? calendario.fechaFin.toDate() : null;
  } else if (calendario.radioFechaFin == 1) {
    params.repeticiones = calendario.numRepeticiones;
  } else {
    params.sinFechaFin = true;
  }

  if (calendario.frecuenciaSeleccionada == TipoFrecuenciasCalendario.Diaria) {
    params.diaria = true;
    if (calendario.diariaCantidadDiasRadio == 0) {
      params.multiploDias = calendario.diariaNumDias;
    } else {
      params.semanaLaboral = true;
    }
  }

  if (calendario.frecuenciaSeleccionada == TipoFrecuenciasCalendario.Semanal) {
    params.semanal = true;
    params.multiploSemanas = calendario.semanalCantidadSemanas;
    params.CalendarioDiasSemana = diasSemanasNumeros(
      calendario.semanalDiasSemana
    );
  }

  if (calendario.frecuenciaSeleccionada == TipoFrecuenciasCalendario.Mensual) {
    params.mensual = true;
    if (calendario.mensualRadio == 0) {
      params.calendarioDiasMes = [
        { idCalendario: 0, nroDiaMes: calendario.mensualDiaMes },
      ];
      params.multiploMes = calendario.mensualCantMeses;
    }
    if (calendario.mensualRadio == 1) {
      params.numeroSemana = calendario.mensualDiaSemanaNum;
      params.CalendarioDiasSemana = [
        { idCalendario: 0, nroDiaSemana: calendario.mensualDiaSemanaNombre },
      ];
      params.multiploMes = calendario.mensualNumMeses;
    }
  }

  if (calendario.frecuenciaSeleccionada == TipoFrecuenciasCalendario.Anual) {
    params.anual = true;
    params.multiploAnios = calendario.anualCantAnios;
    params.calendarioDiasMes = [
      { idCalendario: 0, nroDiaMes: calendario.anualNumDiaMes },
    ];
    params.multiploMes = calendario.anualCantMeses;
  }

  return axios.http.post(`Calendario/${params.clienteId}`, params);
};

export const crearCalendario = (calendario: CalendarioNuevoForm) =>
  makeHttpRequest(calendario);

export type Mes = {
  idCalendario?: number;
  nroMes?: number;
};

export type diaDelMes = {
  idCalendario?: number;
  nroDiaMes?: number;
};

export type diaDeLaSemana = {
  idCalendario?: number;
  nroDiaSemana?: number;
};

function diasSemanasNumeros(diasSemana: number[]) {
  let diasNum: diaDeLaSemana[] = [];
  diasSemana.forEach(dia => {
    switch (dia) {
      case 1:
        {
          let dai: any = {
            idCalendario: 0,
            nroDiaSemana: 1,
          };
          diasNum.push(dai);
        }
        break;
      case 2:
        {
          let dai: any = {
            idCalendario: 0,
            nroDiaSemana: 2,
          };
          diasNum.push(dai);
        }
        break;
      case 3:
        {
          let dai: any = {
            idCalendario: 0,
            nroDiaSemana: 3,
          };
          diasNum.push(dai);
        }
        break;
      case 4:
        {
          let dai: any = {
            idCalendario: 0,
            nroDiaSemana: 4,
          };
          diasNum.push(dai);
        }
        break;
      case 5:
        {
          let dai: any = {
            idCalendario: 0,
            nroDiaSemana: 5,
          };
          diasNum.push(dai);
        }
        break;
      case 6:
        {
          let dai: any = {
            idCalendario: 0,
            nroDiaSemana: 6,
          };
          diasNum.push(dai);
        }
        break;
      case 7:
        {
          let dai: any = {
            idCalendario: 0,
            nroDiaSemana: 7,
          };
          diasNum.push(dai);
        }
        break;
      default:
        break;
    }
  });
  return diasNum;
}

function returnDefault(params: CrearCalendarioHttpRequestParams) {
  let calendarioDefault: CrearCalendarioHttpRequestParams = params;
  calendarioDefault.id = 0;
  calendarioDefault.diaria = false;
  calendarioDefault.semanaLaboral = null;
  calendarioDefault.semanal = false;
  calendarioDefault.mensual = false;
  calendarioDefault.anual = false;
  calendarioDefault.fechaFin = null;
  calendarioDefault.multiploDias = null;
  calendarioDefault.multiploSemanas = null;
  calendarioDefault.multiploMes = null;
  calendarioDefault.multiploAnios = null;
  calendarioDefault.repeticiones = null;
  calendarioDefault.sinFechaFin = null;
  calendarioDefault.numeroSemana = null;

  calendarioDefault.calendarioMes = [];
  calendarioDefault.calendarioDiasMes = [];
  calendarioDefault.CalendarioDiasSemana = [];
  return calendarioDefault;
}
