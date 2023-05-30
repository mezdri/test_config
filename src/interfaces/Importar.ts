import { EstadoEntidad } from '@/config/enums';
export type RouteViews = 'all' | 'completed' | 'active';

export interface IImportar {
  id?: number;
  importarModuloId?: number;
  ArchivoRef?: string;
  ClienteId?: number;
  RegistrosNum?: number;
  RegistrosOk?: number;
  RegistrosError?: number;
  descripcion?: string;
  estado?: EstadoEntidad;
  modulo?: string;
}
