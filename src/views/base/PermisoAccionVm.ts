import { CodigoAccion } from './VariablesPermisos';
export class PermisoAccionVm {
  accion?: string;
  visible: boolean;
  step: number;
  codigoSubAccion?: number;
  codigoAccionPadre?: CodigoAccion;
  validacion?: Function;
}
