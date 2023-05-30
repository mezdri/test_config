import { PasoCrud } from '@/reusable/Mantenedor/mantenedorUtils';

export const isPasoValido = async (pasoActivo: PasoCrud) => {
  if (pasoActivo.formState && pasoActivo.formState.validator) {
    if (!(await pasoActivo.formState.validator.validateAll())) {
      return false;
    }
  }

  return pasoActivo.permitirContinuar ? pasoActivo.permitirContinuar() : true;
};
