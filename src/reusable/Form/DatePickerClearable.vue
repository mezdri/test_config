<template>
  <div>
    <v-text-field
      v-if="readonly || disabled"
      :label="label"
      :value="formattedValue"
      :error-messages="errorMessages"
      :name="id"
      :data-testid="testId"
      slot="activator"
      persistent-hint
      prepend-icon="event"
      :readonly="readonly"
      :disabled="disabled"
    />
    <v-menu
      v-else
      :close-on-content-click="false"
      :nudge-right="40"
      v-model="isOpen"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
      class="menu"
    >
      <v-text-field
        :label="label"
        :value="formattedValue"
        :error-messages="errorMessages"
        :name="id"
        :data-testid="testId"
        slot="activator"
        persistent-hint
        prepend-icon="event"
        readonly
        :disabled="disabled"
        :ref="myRef"
        clearable
        @click:clear="clearDate()"
      ></v-text-field>
      <v-date-picker
        :value="vuetifyFormattedValue"
        first-day-of-week="1"
        locale="es-cl"
        scrollable
        @input="handleChange"
        :max="max"
        :min="min"
      ></v-date-picker>
    </v-menu>
  </div>
</template>

<script>
import moment from 'moment';

const vuetifyDateFormat = 'YYYY-MM-DD';

export default {
  name: 'DatePicker',
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
      // moment
      type: null,
      default: null,
    },
    testId: String,
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    max: String,
    min: String,
    format: { type: String, default: 'DD/MM/YYYY' },
    myRef: String,
    isClearable: { type: Boolean, default: false },
  },
  data: () => ({
    isOpen: false,
  }),
  methods: {
    handleChange(value) {
      this.isOpen = false;
      this.$emit('input', moment(value, vuetifyDateFormat));
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
      return value.format(this.format);
    },
    vuetifyFormattedValue() {
      const { value } = this;
      if (!value) {
        return value;
      }
      return this.value.format(vuetifyDateFormat);
    },
  },
};
</script>
<style scoped>
.menu {
  display: block;
}
</style>
