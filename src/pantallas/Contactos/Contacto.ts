import { TipoContacto } from '@/pantallas/TipoContacto/TipoContacto';
import moment from 'moment';

export type Contacto = {
  id?: number;
  nombre?: string;
  correo?: string;
  fono?: string;
  empresa?: string;
  rut?: string;
  tipoContactoText?: string;
  tipoContactoId?: number;
  usuarioCreador?: string;
  usuarioModifica?: string;
  fechaCreacion?: moment.Moment;
  fechaModificacion?: moment.Moment;
  estado?: number;
  estadoTxt?: string;
  listaDistribucionId?: number[];
  totalAsociados?: number;
};
