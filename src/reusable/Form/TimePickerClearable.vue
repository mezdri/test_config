<template>
  <v-text-field
    type="time"
    prepend-icon="access_time"
    :label="label"
    :value="formattedValue"
    :data-vv-name="id"
    :data-testid="testId"
    @input="handleChange"
    v-bind="{ ...$props, ...$attrs }"
    clearable
    @click:clear="clearDate()"
  />
</template>

<script>
import moment from 'moment';

export default {
  name: 'TimePicker',
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
    errorMessages: {
      type: null,
    },
    value: {
      type: null,
      default: null,
    },
    testId: String,
    disabled: { type: Boolean, default: false },
  },
  data: () => ({
    isOpen: false,
  }),
  methods: {
    handleChange(hoursMinutes) {
      const { value } = this;
      const [hours, minutes] = hoursMinutes.split(':');
      const setTime = date => {
        if (hoursMinutes == '') {
          return null;
        }
        date.hour(hours);
        date.minute(minutes);
        return date;
      };
      const emit = value => this.$emit('input', value);

      if (!value) {
        emit(setTime(moment()));
        return;
      }
      emit(setTime(value));
    },
    clearDate(value) {
      this.$emit('input', null);
    },
  },
  computed: {
    formattedValue() {
      const { value } = this;
      if (!value) {
        return value;
      }
      return value.format('HH:mm');
    },
  },
};
</script>
