import moment from 'moment';

export type Giro = {
  id: number;
  nombre: string;
  estado: number[];
  usuarioCreadorId: number;
  fechaCreacion: moment.Moment;
  usuarioModificacionId: number;
  fechaModificacion: string;
};
