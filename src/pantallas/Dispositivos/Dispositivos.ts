import moment from 'moment';

export type DispositivoNuevo = {
  id: number;
  nombre: string;
  descripcion?: string;
  tipoDispositivoId: number;
  icono: string;
  iconoBase64?: string;
  isGps: boolean;
  marca: string;
  modelo: string;
  estado: number;
  totalAsociados: number;
  dispositivoCampoVm?: DatoExtendido[];
};

export type DatoExtendido = {
  id: number;
  trama: string;
  posicion: number;
  nombre?: string;
  tipoMedidaId?: number;
  tipoMedidaText?: string;
  descripcion?: string;
  icono?: string;
  iconoBase64?: string;
  link?: string;
  dispositivoId?: number;
  fechaModificacion: moment.Moment;
  usuarioModifica: string;
  fechaCreacion: moment.Moment;
  usuarioCreador: string;
  scriptMostrar: string;
};

export type DatoExtendidoNuevo = {
  id: number;
  trama: string;
  posicion: number;
  nombre?: string;
  tipoMedidaId?: number;
  tipoMedidaText?: string;
  descripcion?: string;
  icono?: string;
  iconoBase64?: string;
  link?: string;
  dispositivoId?: number;
  scriptMostrar: string;
};
