import moment from 'moment';

export type TipoContacto = {
  id?: number;
  nombre?: string;
  descripcion?: string;
  usuarioCreador?: string;
  usuarioModifica?: string;
  fechaCreacion?: moment.Moment;
  fechaModificacion?: moment.Moment;
  estadoTxt?: string;
  estado?: number;
};
