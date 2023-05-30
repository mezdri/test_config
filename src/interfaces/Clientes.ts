import { EstadoEntidad } from '@/config/enums';
export type RouteViews = 'all' | 'completed' | 'active';

export interface IClientes {
  id?: number;
  rut?: string;
  nombre?: string;
  giro?: string;
  direccion?: string;
  telefono1?: string;
  email?: string;
  logo?: any;
  estado?: EstadoEntidad;
  checked?: boolean;
  estadoTxt?: string;
  accesoUsuarios?: boolean;
  recepcionActividades?: boolean;
  sincronizarCrm?: boolean;
  accesoUsuariosTxt?: string;
  recepcionActividadesTxt?: string;
  sincronizarCrmTxt?: string;
}
