import moment from 'moment';

export type Mensaje = {
  id: number;
  titulo: string;
  mensaje: string;
  estado: number;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
};

export type MensajeSelected = {
  id: number;
  titulo: string;
  mensaje: string;
  estado: number;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
  selected: boolean;
};

export type MnsajeNuevo = {
  titulo: string;
  mensaje: string;
  estado: number;
};

export type Variables = {
  id: number;
  nombreVariable: string;
  nombreValor: string;
  nombreMostrar: string;
};

export type MensajeDetalle = {
  id: number;
  idEvento: number;
  titulo: string;
  mensaje: string;
  estado: number;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
};
