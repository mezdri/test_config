<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md>
            <FormFieldsContainer :titulo="titulo">
              <slot name="prependInformacionGeneral" />

              <v-layout row wrap v-show="!isVerDetalle">
                <v-flex x6 sm6 md6>
                  <v-text-field
                    type="number"
                    :label="formFields.vmaxima.label"
                    v-model="formFields.vmaxima.value"
                    v-validate="'numeric|max_value:200|min_value:0|integer'"
                    :data-vv-name="formFields.vmaxima.id"
                    :id="formFields.vmaxima.id"
                    counter="50"
                    :disabled="isVerDetalle"
                    :error-messages="errors.collect(formFields.vmaxima.id)"
                  />
                </v-flex>
              </v-layout>
            </FormFieldsContainer>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { FormChangeEvent, FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import Confirmation from '@/components/Confirmation.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';
import moment from 'moment';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import { number } from 'node_modules/@types/yup';

@Component({
  components: {
    FormFieldsContainer,
    Confirmation,
    ConfirmacionEliminar,
    MantenedorGrid,
  },
})
export default class ComandoVelocidadAsignacion extends Vue {
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ default: false }) esEditar: boolean;

  mostrarConfirmacionEliminar: boolean = false;
  mostrarDatos: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;

  hint: string = '';
  estado: boolean = true;
  seleccionEstado: number = 0;
  titulo: string = 'Seleccionar Velocidad Máxima';
  asignacionVelocidad: number;

  isValidateTP: boolean = false;
  isValidateRM: boolean = false;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  formFields: FormFieldDefMap = {
    vmaxima: {
      label: 'Velocidad Máxima',
      id: 'vmaxima',
      value: '',
    },
  };

  created() {
    this.isValidateTP = false;
    this.isValidateRM = false;
    if (this.isVerDetalle) {
      this.titulo = 'Velocidad Máxima';
    }
  }

  handleCierraModalSinGuardar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
  }

  async handleCierreModalBtnGuardar(e: FormChangeEvent) {
    this.mostrarModalCrear = false;
  }
  async handleCierreModalBtnGuardarEditar(e: FormChangeEvent) {}

  constructor() {
    super();
  }

  @Watch('formFields', { deep: true })
  handleFormChange(fields: FormFieldDefMap) {
    this.asignacionVelocidad = parseInt(
      this.formFields.vmaxima.value.toString()
    );
    this.$emit('handleFormChangeEventosVelocidad', this.asignacionVelocidad); // tiene el nombre del objeto a quien le devuelve el valor
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
.icon {
  background-color: #ffe800 !important;
  color: black !important;
  margin-left: -10px !important;
  padding-right: 20px;
}
</style>
