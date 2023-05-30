<template>
  <v-text-field
    @input="handleChange"
    :label="label"
    :data-vv-name="id"
    :value="value"
    v-bind="{ ...$props, ...$attrs }"
  />
</template>
<script>
import { Validator } from 'vee-validate';
import { omit } from 'lodash';
import { validateUniqueField } from '@/reusable/Data/validateUniqueField';

export const uniqueFieldRule = 'UniqueField';

export default {
  name: 'CampoUnico',
  $_veeValidate: {
    value() {
      return this.value;
    },
    name() {
      return this.id;
    },
  },
  props: {
    label: String,
    id: String,
    value: {
      type: null,
      default: null,
    },
    testId: String,
    uniqueFieldRules: String,
    url: String,
    validate: Function,
    message: String,
  },
  data: () => ({ omit }),
  methods: {
    handleChange(value) {
      this.$emit('input', value);
    },
  },
  mounted() {
    const self = this;

    Validator.extend(uniqueFieldRule, {
      getMessage(field, params, data) {
        return `* ${self.message}`;
      },
      validate(value) {
        if (value === '') {
          return true;
        }
        return validateUniqueField(self.validate, value)
          .then(response => ({
            valid: !response,
            data: response
              ? undefined
              : {
                  message: `* ${self.message}`,
                },
          }))
          .catch(() => true);
      },
    });
  },
};
</script>
