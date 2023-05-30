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
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Información General">
              <slot name="prependInformacionGeneral" />
              <v-flex xs12 sm12 md12 v-show="mostrarActivo">
                <v-switch
                  :label="formFields.activo.label"
                  :color="'success'"
                  v-model="formFields.activo.value"
                  persistent-hint
                  @change="cambioEstadoSwitch"
                  :hint="mensajeEstado"
                  :readonly="modoVer"
                />
              </v-flex>
              <v-flex x12 sm12 md12>
                <CampoUnico
                  :label="formFields.nombre.label"
                  v-model="formFields.nombre.value"
                  v-validate="`required|max:80|${uniqueFieldRule}`"
                  :id="formFields.nombre.id"
                  counter="80"
                  :disabled="modoVer"
                  :error-messages="errors.collect(formFields.nombre.id)"
                  :validate="validarNombreTipo"
                  message=" Ya existe un Tipo Mantenimiento con este nombre."
                ></CampoUnico>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-select
                  :label="formFields.categoria.label"
                  v-validate="'required'"
                  :error-messages="errors.collect(formFields.categoria.id)"
                  :data-vv-name="formFields.categoria.id"
                  v-model="formFields.categoria.value"
                  :items="lstCategorias"
                  item-text="nombre"
                  item-value="id"
                  :disabled="modoVer || totalAsociados > 0"
                />
              </v-flex>
              <v-flex x12 sm12 md12>
                <v-text-field
                  :label="formFields.descripcion.label"
                  v-validate="'max:200'"
                  :error-messages="errors.collect(formFields.descripcion.id)"
                  :data-vv-name="formFields.descripcion.id"
                  v-model="formFields.descripcion.value"
                  counter="200"
                  :disabled="modoVer"
                />
              </v-flex>
            </FormFieldsContainer>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import TextField from '@/reusable/Form/TextField.vue';
import {
  emitFormChangeEvent,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate';
import { EstadoEntidad, CategoriaTipoMantenimiento } from '@/config/enums';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import CampoUnico, { uniqueFieldRule } from '@/reusable/Form/CampoUnico.vue';

import { TipoMantenimiento } from './TipoMantenimiento';

@Component({
  components: {
    TextField,
    FormFieldsContainer,
    CampoUnico,
  },
})
export default class TipoMantenimientoForm extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop({ default: true }) mostrarActivo: boolean;
  @Prop() tipoMantenimientoSeleccionado: TipoMantenimiento;

  axios = new AxiosVue(ServicioProxy.Mantenimiento);
  isFormValid: boolean = false;
  totalAsociados: number = 0;

  mensajeEstado: string = '';
  uniqueFieldRule = uniqueFieldRule;

  lstCategorias: any[] = [
    {
      id: CategoriaTipoMantenimiento.Preventiva,
      nombre: 'Preventiva',
    },
    {
      id: CategoriaTipoMantenimiento.Correctiva,
      nombre: 'Correctiva',
    },
  ];

  formFields: FormFieldDefMap = {
    activo: {
      label: 'Activo',
      id: 'activo',
      value: 'false',
    },
    nombre: {
      label: 'Nombre',
      id: 'nombre',
      value: '',
    },
    categoria: {
      label: 'Categoría',
      id: 'categoria',
      value: '',
    },
    descripcion: {
      label: 'Descripción',
      id: 'descripcion',
      value: '',
    },
  };

  mounted() {
    this.$validator.localize('es', makeValidatorDictionary(this.formFields));
    this.handleFormChange();
    this.handleTipoMantenimientoSeleccionadoChange();
  }

  validarNombreTipo(nombre: string) {
    const self = this;
    const id =
      this.tipoMantenimientoSeleccionado === undefined
        ? 0
        : this.tipoMantenimientoSeleccionado.id;
    return self.axios.http.get(
      `TipoMantenimiento/ChequearNombreUnico/${id}/${nombre}/`
    );
  }

  @Watch('tipoMantenimientoSeleccionado', { deep: true })
  handleTipoMantenimientoSeleccionadoChange() {
    if (!this.tipoMantenimientoSeleccionado) {
      this.totalAsociados = 0;
      return;
    }
    this.formFields.nombre.value = this.tipoMantenimientoSeleccionado.nombre;
    this.formFields.categoria.value = this.tipoMantenimientoSeleccionado.categoriaTipoMantenimiento;
    this.formFields.descripcion.value = this.tipoMantenimientoSeleccionado.descripcion;
    this.formFields.activo.value =
      this.tipoMantenimientoSeleccionado.estado == EstadoEntidad.Activo;
    this.totalAsociados = this.tipoMantenimientoSeleccionado.totalAsociados;
    this.cambioEstadoSwitch(this.formFields.activo.value);
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          nombre: this.formFields.nombre.value,
          descripcion: this.formFields.descripcion.value,
          categoriaTipoMantenimiento: this.formFields.categoria.value,
          estado: this.formFields.activo.value
            ? EstadoEntidad.Activo
            : EstadoEntidad.Inactivo,
        } as TipoMantenimiento,
      },
      this
    );
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  cambioEstadoSwitch(isActivo: boolean) {
    //this.fields[this.formFields.activo.id].dirty = true;
    this.handleFormChange();
    if (isActivo) {
      this.mensajeEstado = '';
      this.formFields.activo.label = 'Activo';
    } else {
      if (this.totalAsociados === 0) {
        this.mensajeEstado =
          'Al dejar como inactivo, no se podrán realizar asociaciones.';
      }
      this.formFields.activo.label = 'Inactivo';
    }
    this.$emit('estadoSwitch', isActivo);
  }
}
</script>
