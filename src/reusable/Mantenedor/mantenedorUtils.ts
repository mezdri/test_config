import { FormState, GenericFormState } from '@/reusable/Form/formUtils';
export enum OperacionesCrud {
  crear,
  editar,
  eliminar,
  consultar,
}

export type PasoCrud = {
  accion: string;
  visible: boolean;
  step: number;
  title: string;
  icon: string;
  /**
   * Campos para validar permisos
   */
  codigoSubAccion?: number;
  codigoAccionPadre?: number;
  /**
   * Estado del formulario asociado a este paso
   */
  formState?: FormState;
  /**
   * Validación adicional al "Continuar" y "Guardar"
   */
  permitirContinuar?: () => boolean;
};

export interface GenericPasoCrud<T> extends PasoCrud {
  formState?: GenericFormState<T>;
}

export type PasosCrud = { [key: string]: PasoCrud };
