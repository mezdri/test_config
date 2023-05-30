<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md text-xs-center>
            <StepTitle>Seleccionar Códigos</StepTitle>
            <v-layout wrap>
              <v-flex xs10 sm10 md10>
                <v-text-field
                  :label="formFields.nombre.label"
                  v-validate="'required|max:80|AlertaNombreUnicoCrear'"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :data-vv-name="formFields.nombre.id"
                  v-model="formFields.nombre.value"
                  :counter="80"
                  :disabled="modoVer"
                ></v-text-field>
              </v-flex>
              <v-flex xs2 sm2 md2 align-end>
                <v-checkbox
                  v-model="formFields.esAcumulable.value"
                  :label="formFields.esAcumulable.label"
                  :data-vv-name="formFields.esAcumulable.id"
                  :disabled="modoVer"
                ></v-checkbox>
              </v-flex>
            </v-layout>
            <v-layout wrap>
              <v-flex>
                <AsociarTiposActividad
                  v-model="idsTipoActividad"
                  :readonly="modoVer"
                  :esEditar="esEditar"
                />
              </v-flex>
            </v-layout>
            <br />
            <br />
            <v-layout wrap>
              <v-flex>
                <AsociarDispositivos
                  v-model="idsDispotivo"
                  :readonly="modoVer"
                  :esEditar="esEditar"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

const { AgGridVue } = require('ag-grid-vue');
import { Validator } from 'vee-validate';

import {
  emitFormChangeEvent,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';

import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import { typeConfigBase, AlertasBaseBackend } from './ConfiguracionBase';
import AsociarTiposActividad from '@/pantallas/DescargaActividades/crud/crear/AsociarTiposActividad.vue';
import AsociarDispositivos from '@/reusable/Dispositivos/AsociarDispositivos.vue';

@Component({
  components: {
    AsociarDispositivos,
    AsociarTiposActividad,
    StepTitle,
  },
})
export default class SeleccionarCodigosForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop({ default: false }) esEditar: boolean;
  @Prop() alertaBaseSeleccionada: AlertasBaseBackend;

  axios: AxiosVue = new AxiosVue(ServicioProxy.Alerta);
  readonly Controller: string = 'AlertaBase';

  isFormValid: boolean = false;
  formFields: FormFieldDefMap = {
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    esAcumulable: {
      label: 'Es Acumulable',
      id: 'esAcumulable',
      value: false,
    },
  };

  idsTipoActividad = this.alertaBaseSeleccionada
    ? this.alertaBaseSeleccionada.alertaBaseCodigoActividad.map(
        x => x.actividadTipoId
      )
    : [];
  idsDispotivo = this.alertaBaseSeleccionada
    ? this.alertaBaseSeleccionada.alertaBaseDispositivo.map(
        x => x.dispositivoId
      )
    : [];

  /* misc */

  mounted() {
    this.registrarValidadores();
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    this.handleFormChange();
    this.handleAlertaSeleccionadaChange();
  }

  registrarValidadores() {
    const self = this;

    Validator.extend('AlertaNombreUnicoCrear', {
      getMessage(field: any, params: any, data: any) {
        return '* Ya existe una Alerta con este nombre.';
      },
      validate(value: any) {
        if (value !== '') {
          var id = self.alertaBaseSeleccionada
            ? self.alertaBaseSeleccionada.id
            : 0;

          return self.axios.http
            .get(`${self.Controller}/${id}/${value}/NombreUnico`)
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: !response.data,
                  data: !response.data
                    ? undefined
                    : { message: '* Ya existe una Alerta con este nombre.' },
                });
              });
            })
            .catch(err => {
              return true;
            });
        } else {
          return true;
        }
      },
    });
  }

  /* event handlers */

  @Watch('idsTipoActividad')
  handleTiposActividadChange() {
    this.$emit('setCodeAct', this.idsTipoActividad);
  }

  @Watch('idsDispotivo')
  handleDispositivosChange() {
    this.$emit('setCodeActExt', this.idsDispotivo);
  }

  @Watch('alertaBaseSeleccionada', { deep: true })
  handleAlertaSeleccionadaChange() {
    if (this.alertaBaseSeleccionada) {
      this.formFields.nombre.value = this.alertaBaseSeleccionada.nombre;
      this.formFields.esAcumulable.value = this.alertaBaseSeleccionada.acumulable;
    }
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    const { formFields } = this;

    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          nombre: formFields.nombre.value,
          esAcumulable: formFields.esAcumulable.value,
        },
      },
      this
    );
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.handleFormChange();
  }
}
</script>
