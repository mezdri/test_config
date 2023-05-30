<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      :titulo="'Crear Proveedor de GPS'"
      @cerrar="dialogConfirmacionClose = true"
    >
      <VolverButton @click="handleVolver" v-show="showVolver" />&nbsp;&nbsp;
      <ContinuarButton
        @click="handleContinuar"
        v-show="showContinuar && showInactivo"
        :disabled="disableContinuar"
      />
      <GuardarButton
        @click="handleGuardar"
        v-show="showGuardar || !showInactivo"
        :disabled="disableContinuar"
      />
    </CabeceraModal>
    <v-stepper v-model="pasoActivoIndex">
      <v-stepper-header>
        <v-stepper-step
          v-show="pasos.informacionGeneral.visible"
          :complete="pasoActivoIndex > pasos.informacionGeneral.step"
          :step="pasos.informacionGeneral.step"
          >Información General</v-stepper-step
        >
        <v-divider v-show="pasos.informacionGeneral.visible" />
        <v-stepper-step
          v-show="pasos.asociarClienteProveedor.visible"
          :complete="pasoActivoIndex > pasos.asociarClienteProveedor.step"
          :step="pasos.asociarClienteProveedor.step"
          >Asociar Cliente Proveedor de GPS</v-stepper-step
        >
        <v-divider v-show="!pasos.informacionGeneral.visible" />
      </v-stepper-header>
      <v-stepper-items class="cardnew">
        <v-stepper-content
          v-show="pasos.informacionGeneral.visible"
          :step="pasos.informacionGeneral.step"
        >
          <ProveedorForm @change="handleFormChange" />
        </v-stepper-content>
        <v-stepper-content
          v-show="pasos.asociarClienteProveedor.visible"
          :step="pasos.asociarClienteProveedor.step"
        >
          <ClienteProveedorGrid @change="handleClientesProveedoresChange" />
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    ></Confirmation>
    <Confirmation
      :show="dialogConfirmIncativo"
      :titulo="
        $t('mensajes.crud.crear.titulo', {
          entidad: 'Cliente Proveedor de GPS',
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.crear.titulo', {
          entidad: 'Proveedor de GPS',
        })
      "
      :mensaje="mensajeConfirmacion"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor, {
  scrollModalIntoView,
} from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';

import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import Confirmation from '@/components/Confirmation.vue';
import config from '@/config/index';

import ProveedorForm from '@/pantallas/Proveedor/ProveedorForm.vue';
import ClienteProveedorGrid from '@/pantallas/Proveedor/ClienteProveedorGrid.vue';

import { FormChangeEvent } from '@/reusable/Form/formUtils';
import moment from 'moment';
import { Proveedor, makeProveedorPasosCrear } from './Proveedor';
import { ClienteProveedor } from '../ClienteProveedor/ClienteProveedor';

import { crearProveedor } from '@/pantallas/Proveedor/crearProveedor';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

type CrearFormState = {
  entity: Proveedor;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    GuardarButton,
    ContinuarButton,
    VolverButton,
    Confirmation,
    ProveedorForm,
    ClienteProveedorGrid,
  },
})
export default class CrearProveedorModal extends OperacionCrud {
  @Prop({ required: true }) show: boolean;

  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.Proveedor;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  dialogConfirmIncativo: boolean = false;
  mensajeConfirmacion: any = '';
  mensajeConfirmacionInactivo: any = '';

  showVolver: boolean = false;
  showContinuar: boolean = true;
  showGuardar: boolean = false;
  showInactivo: boolean = true;

  disableContinuar: boolean = false;

  contadorPasos: number = 0;

  seleccionClienteProveedor: ClienteProveedor[] = [];

  form: CrearFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };

  pasoActivoIndex = 1;
  pasos: PasosCrud = makeProveedorPasosCrear();

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.pasoActivoIndex = 1;
  }

  /* event handlers */

  handleCerrar() {
    this.pasoActivoIndex = 1;
    this.handleVolver();
    this.$emit('cerrar');
  }

  async handleContinuar() {
    const isValid = await this.form.validator.validateAll();

    if (isValid) {
      this.pasoActivoIndex++;
      this.showVolver = true;
      this.showGuardar = true;
      this.showContinuar = false;
      scrollModalIntoView();
    } else {
      this.disableContinuar = true;
    }
  }

  handleVolver() {
    this.pasoActivoIndex--;
    this.showVolver = false;
    this.showContinuar = true;
    this.showGuardar = false;
    scrollModalIntoView();
  }

  async handleGuardar() {
    const isValid = await this.form.validator.validateAll();
    const activ = this.form.entity.estado;

    if (!isValid) {
      this.disableContinuar = true;
      return;
    }

    if (activ == 0) {
      this.mensajeConfirmacionInactivo =
        'Al dejar como inactivo, no se podrán realizar asociaciones. ¿Está seguro que desea crear el Proveedor de GPS?';
      this.dialogConfirmIncativo = true;
    } else if (isValid) {
      this.mensajeConfirmacion = this.$t('mensajes.crud.crear.mensaje', {
        entidad: 'el Proveedor de GPS',
      });
      this.dialogConfirmacionGuardar = true;
    }
  }

  handleConfirmacionGuardar(isConfirm: boolean) {
    this.dialogConfirmacionGuardar = false;
    this.dialogConfirmIncativo = false;

    if (isConfirm) {
      let clientesSeleccionados = this.seleccionClienteProveedor.map(
        lista => lista.id
      );
      if (!this.showInactivo) {
        clientesSeleccionados = [];
      }
      let formulario: any = this.form.entity;

      let nuevoProveedor = {
        rut: formulario.rut,
        nombre: formulario.nombre,
        giroId: formulario.idGiro,
        direccion: formulario.direccion,
        comercialNombre: formulario.comercialNombre,
        comercialTelefono: formulario.comercialTelefono,
        comercialEmail: formulario.comercialEmail,
        tecnicoNombre: formulario.tecnicoNombre,
        tecnicoTelefono: formulario.tecnicoTelefono,
        tecnicoEmail: formulario.tecnicoEmail,
        estado: formulario.estado,
        clienteProveedorId: clientesSeleccionados,
      };

      this.loadingService.showLoading();
      return crearProveedor(nuevoProveedor)
        .catch(() =>
          this.$snotify.error(
            'Ha ocurrido un error al intentar crear el Proveedor de GPS',
            { timeout: 3000 }
          )
        )
        .then(() => {
          this.$snotify.success(
            'Proveedor de GPS ha sido creado de forma exitosa',
            {
              timeout: 3000,
            }
          );
          this.handleCerrar();
        })
        .finally(() => {
          this.loadingService.hideLoading();
        });
    }
  }

  async handleFormChange(event: FormChangeEvent) {
    this.form = event;
    if (this.disableContinuar) {
      const isValid =
        (await this.form.validator.errors.items.length) > 0 ? false : true;
      if (isValid) {
        this.disableContinuar = false;
      }
    }
    if (this.form.entity.estado == 0) {
      this.showInactivo = false;
    } else {
      this.showInactivo = true;
    }
    this.disableContinuar =
      this.form.validator.errors.items.length > 0 ? true : false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.handleCerrar();
    }
  }

  handleClientesProveedoresChange(actividadMantenimiento: ClienteProveedor[]) {
    this.seleccionClienteProveedor = actividadMantenimiento;
  }

  mounted() {
    //Quitar cuando se implemente reusable navegacionCrud.
    this.contadorPasos = 0;
    Object.values(this.pasos).forEach(value => {
      if (value.visible) {
        this.contadorPasos++;
      }
    });

    if (this.contadorPasos === 1) {
      this.showVolver = false;
      this.showGuardar = true;
      this.showContinuar = false;
    }
  }
}
</script>
