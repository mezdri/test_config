<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear titulo="Crear Función Global" @cerrar="handleCerrar">
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        :estado-id="estadoId"
        @guardar="handleGuardarClick"
      />
    </CabeceraModalCrear>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.informacionGeneral">
          <InformacionGeneral
            @change="handleFormChange"
            @setScript="handleScript"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.crear.titulo', {
          entidad: 'Función Global',
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';

import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import {
  makeFuncionGlobalPasosCrear,
  FuncionGlobal,
} from '@/pantallas/FuncionesGlobales/servicios/Funciones';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';

import InformacionGeneral from '@/pantallas/FuncionesGlobales/InformacionGeneral.vue';

import { fetchFuncionGlobal } from '@/pantallas/FuncionesGlobales/servicios/CrearFuncionGlobal';

import { FormChangeEvent } from '@/reusable/Form/formUtils';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { EstadoEntidad } from '@/config/enums';
import Confirmation from '@/components/Confirmation.vue';

import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

@Component({
  components: {
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
    CabeceraModalCrear,
    InformacionGeneral,
    ModalMantenedor,
    Confirmation,
    MensajeValidacion,
  },
})
export default class CrearFuncionesGlobales extends OperacionCrud {
  @Prop({ default: true }) show: boolean;

  /* template */

  pasoActivoIndex = 1;
  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.FuncionesGlobales;
  readonly pasos: PasosCrud = makeFuncionGlobalPasosCrear();

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacionInactivo: any = '';

  /* validacion */
  showValidacion: boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';

  scriptFuncionGlobal: string = '';

  constructor() {
    super();
  }

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleConfirmacionGuardar(isConfirmado: boolean) {
    this.dialogConfirmacionGuardar = false;
    if (!isConfirmado) {
      return;
    }

    let formulario: any = {
      nombre: this.pasos.informacionGeneral.formState.entity.nombre.value,
      estado: this.pasos.informacionGeneral.formState.entity.estado.id,
      script: this.scriptFuncionGlobal ? this.scriptFuncionGlobal : '',
    };

    this.loadingService.showLoading();
    return fetchFuncionGlobal(formulario)
      .then(() => {
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.crear', {
            entidad: 'Función Global',
            creadoA: 'creada ',
          })
        );
        this.$emit('crear');
      })
      .catch(() =>
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', {
            entidad: 'Función Global',
          })
        )
      )
      .finally(this.loadingService.hideLoading);
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  handleGuardarClick() {
    if (this.pasos.informacionGeneral.formState.entity.estado.id == 0) {
      this.mensajeConfirmacionInactivo =
        'Al dejar como inactivo, no se permitirá aplicar la función. ¿Está seguro que desea crear la Función Global?';
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'la Función Global' }
      );
    }
    this.dialogConfirmacionGuardar = true;
  }

  handleScript(script: string) {
    this.scriptFuncionGlobal = script;
  }

  get estadoId() {
    const { entity } = this.pasos.informacionGeneral.formState;
    if (!entity) {
      return null;
    }
    return entity.estado.id;
  }
}
</script>
