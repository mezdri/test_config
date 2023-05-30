<template>
  <div>
    <v-select></v-select>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ICellEditor, ICellEditorComp } from 'ag-grid-community';

export default class ComboBoxEditor extends Vue implements ICellEditor {
  params: string = '';
  eInput: any;

  constructor() {
    super();
  }

  getValue() {
    return this.params;
  }
  isPopup() {
    return false;
  }
}
</script>
