export type RouteViews = 'all' | 'completed' | 'active';

export interface ILicenciaTipo {
  id?: number;
  clase?: string;
  nombre?: string;
  descripcion?: string;
  estado?: number;
  usuarioCreadorId?: number;
  usuarioModificacionId?: number;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
  fechaRenovacionDocumento?: Date;
  checked?: boolean;
}
