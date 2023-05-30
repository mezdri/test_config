import { List } from 'lodash';

export type RouteViews = 'all' | 'completed' | 'active';

export interface AccionesInterface {
  id?: number;
  codigo?: number;
  nombre?: string;
  descripcion?: string;
  estado?: number;
  subAcciones?: ISubAccion;
  moduloAccionId?: number;
  accionId?: number;
}

export interface IAccionesPadre {
  id?: number;
  codigo?: number;
  nombre?: string;
  descripcion?: string;
  estado?: number;
}

export interface IModuloAccionSubAccion {
  moduloAccionId: number;
  accionId: number;
  subAcciones: ISubAccion;
}

export interface ISubAccion {
  id: number;
}
