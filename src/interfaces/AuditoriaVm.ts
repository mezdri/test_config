import { EstadoAuditoria } from '@/config/enums';

export class AuditoriaVm {
  id?: number;
  usuario?: string;
  evento?: EstadoAuditoria;
  entidad?: string;
  detalle?: string;
  fecha?: Date;
}
