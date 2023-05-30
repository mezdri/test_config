import moment from 'moment';
import { DatoExtendido } from '@/pantallas/Dispositivos/Dispositivos';

export type Dispositivo = {
  id: number;
  nombre: string;
  descripcion?: string;
  tipoDispositivoId: number;
  icono: string;
  isGps: boolean;
  isGpsText: string;
  marca: string;
  modelo: string;
  estado: number;
  estadoTxt: string;
  totalAsociados: number;
  totalAsociados2?: number;
  dispositivoCampoVm?: DatoExtendido[];
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
  tipoDispositivoText: string;
};
