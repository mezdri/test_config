<template>
  <v-dialog v-model="dialog" persistent max-width="700px">
    <v-toolbar dark color="primary">
      <v-btn icon dark @click="closeModal(null)">
        <v-icon>close</v-icon>
      </v-btn>
      <v-toolbar-title>{{ titulo }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn dark flat :disabled="canStart">Iniciar Carga</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-card>
      <v-card-text>
        <br />
        <div align="center" v-show="!showProgressBar">
          <v-flex d-flex xs6 sm6 md6>
            <label class="file-select">
              <div class="select-button">
                <span color="primary" v-if="value"
                  >Archivo: {{ value.name }}</span
                >
                <span color="primary" v-else>Seleccione archivo</span>
              </div>
              <input
                v-if="clearInputFile"
                type="file"
                @change="handleFileChange"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              />
            </label>
          </v-flex>
        </div>

        <br />

        <div v-if="showProgressBar" align="center">
          <h4>Validando Archivo ( {{ value.name }} ) ...</h4>
          <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>

        <br />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { TipoImportacion } from '../config/enums';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';

@Component
export default class ImportFile extends Vue {
  @Prop({
    default: false,
  })
  show!: boolean;
  @Prop({
    default: 'Importar',
  })
  titulo!: string;
  @Prop({
    default: 0,
  })
  tipo!: TipoImportacion;

  value: File = null;
  dialog: boolean = false;
  clearInputFile: boolean = true;
  showProgressBar: boolean = false;

  get canStart() {
    if (this.showProgressBar == false || this.value != null) return true;
    else return false;
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
  }

  handleFileChange(e: any) {
    if (e.target.files.length > 0) {
      this.value = e.target.files[0];
      this.showProgressBar = true;

      switch (this.tipo) {
        case TipoImportacion.cargaAcciones:
          break;
        case TipoImportacion.cargaRoles:
          break;
        case TipoImportacion.cargaUsuarios:
          break;
        case TipoImportacion.cargaPerfiles:
          break;
      }

      //1.- validar formato archivo
      //2.- validar data archivo
      //3.- retornar información

      if (!this.showProgressBar) {
        this.$emit('importEventCallback', e.target.files[0]);
      }
    } else this.value = null;
  }

  closeModal(file: any) {
    this.showProgressBar = false;
    this.value = null;

    this.clearInputFile = false;
    this.$nextTick(function() {
      this.clearInputFile = true;
    });

    this.$emit('importEventCallback', file);
  }
}
</script>

<style scoped>
.file-select > .select-button {
  padding: 1rem;
  color: white;
  background-color: #27488e;
  border-radius: 0.3rem;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
}

.file-select > input[type='file'] {
  display: none;
}
</style>
