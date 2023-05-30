import { Validator } from 'vee-validate/types/vee-validate';
import moment from 'moment';
import { Vue } from 'vue/types/vue';
import { defaultsDeep } from 'lodash';

import config from '@/config';

type FormFieldDef = {
  label: string;
  id: string;
  value: string | number | boolean | moment.Moment | number[] | object;
  items?: any[];
  type?: string;
  format?: string;
};

export type FormFieldDefMap = Record<string, FormFieldDef>;

export type FormErrors = {
  custom: {
    [key: string]: {
      required?: () => string;
      max?: () => string;
      numeric?: () => string;
      max_value?: () => string;
      min_value?: () => string;
    };
  };
};

export const formErrors = {
  required: {
    required: () => config.errorMensajes.textoRequerido,
  },
  max: {
    max: () => config.errorMensajes.maxLength,
  },
  numeric: {
    numeric: () => config.errorMensajes.soloNumeros,
  },
  max_value: {
    max_value: () => config.errorMensajes.maxLength,
  },
  min_value: {
    min_value: () => config.errorMensajes.minValue,
  },
};

export type FormState = {
  entity: any | null;
  validator: Validator | null;
  isDirty: boolean;
  hasErrors?: boolean;
};
export type GenericFormState<T> = {
  entity: T;
  validator: Validator;
  isDirty: boolean;
  hasErrors: boolean;
};

export type FormChangeEvent = FormState;
export type GenericFormChangeEvent<T> = GenericFormState<T>;

export const emitFormChangeEvent = (
  $emit: (name: string, event: any) => void,
  formState: FormState | Pick<FormState, 'entity'>,
  // @ts-ignore
  componentInstance?: Vue = {}
) => {
  // Validador demora un tick en limpiar errores anteriores de campos dropdown
  setTimeout(() => {
    const validator = componentInstance.$validator;
    $emit('change', {
      validator,
      isDirty: Object.keys(componentInstance.fields || {}).some(
        key => componentInstance.fields[key].dirty
      ),
      hasErrors:
        defaultsDeep(validator, { errors: { items: { length: 0 } } }).errors
          .items.length > 0,
      ...formState,
    });
  });
};

const defaultValidationRules = {
  ...formErrors.required,
  ...formErrors.max,
  ...formErrors.numeric,
  ...formErrors.max_value,
  ...formErrors.min_value,
};

export const makeValidatorDictionary = (
  formFields: FormFieldDefMap,
  rules?: Object
): { custom: any } => ({
  custom: Object.keys(formFields).reduce(
    (dictionary, fieldKey) => ({
      ...dictionary,
      [fieldKey]: { ...defaultValidationRules, ...rules },
    }),
    {}
  ),
});
