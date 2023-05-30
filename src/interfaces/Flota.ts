import { EstadoEntidad } from '@/config/enums';
export type RouteViews = 'all' | 'completed' | 'active';

export interface FlotaInterface {
  id?: number;
  padreId?: number;
  clienteId?: number;
  responsableFlotaId?: number;
  responsableMantenimientoFlotaId?: number;
  nombre?: string;
  descripcion?: string;
  estado?: EstadoEntidad;
  checked?: boolean;
  estadoTxt?: string;
}
export interface IFlota {
  id?: number;
  padreId?: number;
  clienteId?: number;
  responsableFlotaId?: number;
  responsableMantenimientoFlotaId?: number;
  nombre?: string;
  descripcion?: string;
  estado?: EstadoEntidad;
  padre?: number; //Se agrega para congruencia con el servicio de reportes
  checked?: boolean;
}
