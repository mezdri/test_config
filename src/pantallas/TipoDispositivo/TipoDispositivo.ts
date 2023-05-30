import moment from 'moment';

export type TipoDispositivo = {
  id: number;
  nombre: string;
  descripcion?: string;
  marca: string;
  modelo: string;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
  totalAsociados: number;
};

export type TipoDispositivoNuevo = {
  id: number;
  nombre: string;
  descripcion?: string;
  marca: string;
  modelo: string;
};
