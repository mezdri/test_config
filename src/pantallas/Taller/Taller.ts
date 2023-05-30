import moment from 'moment';
import { EstadoEntidad } from '@/config/enums';

export type Taller = {
  id?: number;
  clienteId?: number;
  rut?: string;
  nombre?: string;
  descripcion?: string;
  giro?: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  estado?: EstadoEntidad;
  usuarioCreacion?: string;
  fechaCreacion?: moment.Moment;
  usuarioModificacion?: string;
  fechaModificacion?: moment.Moment;
  estadoTxt?: string;
  totalAsociados?: number;
};
