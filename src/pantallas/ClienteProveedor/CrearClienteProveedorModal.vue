<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      :titulo="'Crear Cliente Proveedor de GPS'"
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
      <v-stepper-header class="position: fixed;">
        <v-stepper-step
          v-show="informacionGeneral.visible"
          :complete="pasoActivoIndex > informacionGeneral.step"
          :step="informacionGeneral.step"
          >Información General</v-stepper-step
        >
        <v-divider />
        <v-stepper-step
          v-show="asociarClienteProveedor.visible"
          :complete="pasoActivoIndex > asociarClienteProveedor.step"
          :step="asociarClienteProveedor.step"
          >Asociar Proveedor de GPS</v-stepper-step
        >
      </v-stepper-header>
      <v-stepper-items class="cardnew">
        <v-stepper-content
          v-show="informacionGeneral.visible"
          :step="informacionGeneral.step"
        >
          <ClienteProveedorForm @change="handleFormChange" />
        </v-stepper-content>
        <v-stepper-content
          v-show="asociarClienteProveedor.visible"
          :step="asociarClienteProveedor.step"
        >
          <ProveedorGrid
            @change="handleProveedoresChange"
            :proveedores="lstProveedores"
          />
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
          entidad: 'Cliente Proveedor de GPS',
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

import ClienteProveedorForm from '@/pantallas/ClienteProveedor/ClienteProveedorForm.vue';
import ProveedorGrid from '@/pantallas/ClienteProveedor/ProveedorGrid.vue';
import { crearCalibracion } from '@/pantallas/CalibracionVehiculo/Services/crearCalibracion';

import { FormChangeEvent } from '@/reusable/Form/formUtils';
import moment from 'moment';
import { ClienteProveedor } from './ClienteProveedor';
import { Proveedor } from '@/pantallas/Proveedor/Proveedor';
import { fetch as fetchProveedoresGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { crearClienteProveedor } from '@/pantallas/ClienteProveedor/crearClienteProveedor';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Funcionalidades } from '@/config/funcionalidades';

type CrearFormState = {
  entity: ClienteProveedor;
  validator: Validator;
};

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    GuardarButton,
    ContinuarButton,
    VolverButton,
    Confirmation,
    ClienteProveedorForm,
    ProveedorGrid,
  },
})
export default class CrearProveedorModal extends ComponenteBaseStepper {
  @Prop({ required: true }) show: boolean;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /*Asbtract */
  funcionalidad: Funcionalidades = Funcionalidades.ClienteProveedor;
  permisosActuales: PermisoAccionVm[] = [];
  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarClienteProveedor: PermisoAccionVm = {
    accion: 'Crear - Asociar Proveedor de GPS',
    visible: true,
    step: 2,
    codigoSubAccion: 69,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarClienteProveedor,
  ];

  created() {
    this.chequearPermisos();
  }

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

  seleccionProveedor: Proveedor[] = [];
  lstProveedores: Proveedor[] = [];

  form: CrearFormState = {
    entity: null,
    validator: null,
  };

  pasoActivoIndex = 1;

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.pasoActivoIndex = 1;
    this.cargarProveedores();
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
        'Al dejar como inactivo, no se podrán realizar asociaciones. ¿Está seguro que desea crear el Cliente Proveedor de GPS?';
      this.dialogConfirmIncativo = true;
    } else if (isValid) {
      this.mensajeConfirmacion = this.$t('mensajes.crud.crear.mensaje', {
        entidad: 'el Cliente Proveedor de GPS',
      });

      this.dialogConfirmacionGuardar = true;
    }
  }

  mounted() {
    if (this.permisosActuales.length === 1) {
      this.showVolver = false;
      this.showGuardar = true;
      this.showContinuar = false;
    }
  }

  handleConfirmacionGuardar(isConfirm: boolean) {
    this.dialogConfirmacionGuardar = false;
    this.dialogConfirmIncativo = false;

    if (isConfirm) {
      let proveedorSeleccionados = this.seleccionProveedor.map(
        lista => lista.id
      );
      if (!this.showInactivo) {
        proveedorSeleccionados = [];
      }
      let formulario: any = this.form.entity;

      let nuevoClienteProveedor = {
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
        proveedorId: proveedorSeleccionados,
      };

      this.loadingService.showLoading();
      return crearClienteProveedor(nuevoClienteProveedor)
        .catch(() =>
          this.$snotify.error(
            'Ha ocurrido un error al intentar crear Cliente Proveedor de GPS',
            { timeout: 3000 }
          )
        )
        .then(() => {
          this.$snotify.success(
            'Cliente Proveedor de GPS ha sido creado de forma exitosa',
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

  handleProveedoresChange(actividadMantenimiento: Proveedor[]) {
    this.seleccionProveedor = actividadMantenimiento;
  }

  async cargarProveedores() {
    this.lstProveedores = (await this.fetchProveedores()) || [];
  }

  fetchProveedores() {
    this.loadingService.showLoading();
    return fetchProveedoresGps()
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los Proveedores',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>
