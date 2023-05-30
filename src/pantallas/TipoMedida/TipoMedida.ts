import moment from 'moment';

export type TipoMedida = {
  id: number;
  sigla: string;
  nombre: string;
  descripcion?: string;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
  totalAsociados: number;
};

export type TipoMedidaNuevo = {
  id: number;
  sigla: string;
  nombre: string;
  descripcion?: string;
};
