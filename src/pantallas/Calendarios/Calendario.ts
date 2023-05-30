import moment from 'moment';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

export type Calendario = {
  id?: number;
  nombreCalendario?: string;
  usuarioCreador?: string;
  usuarioModifica?: string;
  fechaCreacion?: moment.Moment;
  fechaModificacion?: moment.Moment;
  estado?: boolean;
  estadoTxt?: string;
  totalAsociados?: number;
};

export type CalendarioNuevoForm = {
  id?: Calendario['id'];
  nombreCalendario: Calendario['nombreCalendario'];
  estado: Calendario['estado'];
  frecuenciaSeleccionada?: number;
  diariaCantidadDiasRadio?: number;
  diariaNumDias?: number;
  semanalCantidadSemanas?: number;
  semanalDiasSemana?: number[];
  mensualRadio?: number;
  mensualDiaMes?: number;
  mensualCantMeses?: number;
  mensualDiaSemanaNum?: number;
  mensualDiaSemanaNombre?: number;
  mensualNumMeses?: number;
  anualCantAnios?: number;
  anualNumDiaMes?: number;
  anualCantMeses?: number;
  fechaInicio: moment.Moment;
  radioFechaFin?: number;
  fechaFin?: moment.Moment;
  numRepeticiones?: number;
  fechaInicioTxt?: string;
  fechaFinTxt?: string;

  //Log
  usuarioCreador?: string;
  usuarioModifica?: string;
  fechaCreacion?: moment.Moment;
  fechaModificacion?: moment.Moment;
  estadoTxt?: string;
  totalAsociados?: number;
};

export const makeCalendarioPasos = (): PasosCrud => ({
  informacionGeneral: {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    title: 'Información General',
    icon: 'info',
    formState: {
      entity: null,
      validator: null,
      isDirty: false,
    },
  },
});
