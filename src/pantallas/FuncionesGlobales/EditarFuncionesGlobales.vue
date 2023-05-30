<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      :titulo="`Editar Función Global`"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :entidad="'Función Global'"
      :estadoEntidad="estadoEntidad"
      :inactivable="modificable"
      @inactivo="handleInactivo"
      :nombreEntidad="
        pasos.informacionGeneral.formState.entity
          ? pasos.informacionGeneral.formState.entity.nombre.value
          : ''
      "
      :mensajeInactivo="mensajeInactivo"
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />

    <ContenidoModal>
      <InformacionGeneral
        @change="handleFormChange"
        :funcionGlobal="funcionGlobal"
        @setScript="handleScript"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
        :edicion="true"
      />
    </ContenidoModal>
    <Confirmation
      :show="permiteContinuarConfirm"
      :titulo="tituloPermiteContinuar"
      :mensaje="mensajePermiteContinuar"
      :items="itemsNoValidos"
      :mostrarBoton="false"
      v-on:modalConfirmationEmit="permiteContinuarConfirm = false"
    ></Confirmation>
  </ModalMantenedor>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';

import InformacionGeneral from '@/pantallas/FuncionesGlobales/InformacionGeneral.vue';
import {
  makeFuncionGlobalPasosEditar,
  FuncionGlobal,
} from '@/pantallas/FuncionesGlobales/servicios/Funciones';

import { editarFuncionGlobal } from '@/pantallas/FuncionesGlobales/servicios/EditarFuncionGlobal';

import { FormChangeEvent } from '@/reusable/Form/formUtils';

import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { ColDef } from 'ag-grid-community';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import Confirmation from '@/components/Confirmation.vue';

@Component({
  components: {
    ContenidoModal,
    CrudStepsNavBar,
    GuardarCambiosButton,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    CabeceraModalEditar,
    ModalMantenedor,
    Confirmation,
    InformacionGeneral,
  },
})
export default class EditarFuncionesGlobales extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) funcionGlobal: FuncionGlobal;

  /* template */

  pasoActivoIndex = 1;
  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.FuncionesGlobales;
  readonly pasos: PasosCrud = makeFuncionGlobalPasosEditar();

  estadoEntidad: boolean = true;
  modificable: boolean = true;

  /* validacion */
  permiteContinuarConfirm: boolean = false;
  tituloPermiteContinuar: string = '';
  mensajePermiteContinuar: string = '';
  itemsNoValidos: string[] = [];
  mensajeInactivo: string =
    'Al dejar como inactivo, no se permitirá aplicar la función.';

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  scriptFuncionGlobal: string = this.funcionGlobal.script;

  constructor() {
    super();
  }

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    var isCamposValidos = true;
    let formulario: any = {
      id: this.funcionGlobal.id,
      nombre: this.pasos.informacionGeneral.formState.entity.nombre.value,
      estado: this.pasos.informacionGeneral.formState.entity.estado.id,
      script: this.scriptFuncionGlobal ? this.scriptFuncionGlobal : '',
    };

    if (isCamposValidos) {
      this.loadingService.showLoading();

      editarFuncionGlobal(formulario)
        .then(() => {
          this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
          this.$emit('editar');
        })
        .catch(() =>
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'))
        )
        .finally(this.loadingService.hideLoading);
    }
  }

  handleScript(script: string) {
    this.scriptFuncionGlobal = script;
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
    if (this.pasos.informacionGeneral.formState.entity.estado.id == 0) {
      this.modificable = true;
      this.estadoEntidad = false;
    } else {
      this.modificable = true;
      this.estadoEntidad = true;
    }
  }

  handleInactivo() {}
}
</script>
