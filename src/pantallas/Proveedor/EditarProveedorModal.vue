<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      :titulo="'Editar Proveedor de GPS'"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      @inactivo="handleInactivo"
      :inactivable="modificable"
      :estadoEntidad="estadoEntidad"
      :pasos="pasos"
      :inactivoSinAsociacion="inactivoSinAsociacion"
      :pasoActivoIndex="pasoActivoIndex"
      :nombreEntidad="lstProveedor.data ? lstProveedor.data.nombre : ''"
      :entidad="'Proveedor de GPS'"
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />
    <ContenidoModal>
      <ProveedorForm
        :proveedorSeleccionado="lstProveedor.data"
        @change="handleFormChange"
        :nuncaEdit="true"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
      <ClienteProveedorGrid
        @change="handleClientesProveedoresChange"
        :proveedorSeleccionado="lstProveedor.data"
        v-show="pasoActivoIndex === pasos.asociarProveedor.step"
        :esEditar="true"
        :idProveedor="proveedorSeleccionado ? proveedorSeleccionado.id : 0"
      />
    </ContenidoModal>
    <Confirmation
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

import { LoadingService } from '@/services/loadingService';

import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import config from '@/config/index';

import ProveedorForm from '@/pantallas/Proveedor/ProveedorForm.vue';
import ClienteProveedorGrid from '@/pantallas/Proveedor/ClienteProveedorGrid.vue';

import { FormChangeEvent } from '@/reusable/Form/formUtils';
import moment from 'moment';
import { Proveedor, makeProveedorEditar } from './Proveedor';

import { ClienteProveedor } from '../ClienteProveedor/ClienteProveedor';
import { fetchAsociacionProveedor } from '@/pantallas/Proveedor/fetchAsociacionProveedor';

import { editarProveedor } from '@/pantallas/Proveedor/editarProveedor';
import { fetchProveedor } from '@/pantallas/Proveedor/fetchProveedor';

import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

type CrearFormState = {
  entity: Proveedor;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    CabeceraModalEditar,
    ModalMantenedor,
    GuardarCambiosButton,
    ContinuarButton,
    VolverButton,
    Confirmation,
    ProveedorForm,
    ClienteProveedorGrid,
    CrudStepsNavBar,
    ContenidoModal,
  },
})
export default class EditarProveedorModal extends OperacionCrud {
  @Prop({ required: true }) show: boolean;
  @Prop({ required: true }) proveedorSeleccionado: Proveedor;

  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.Proveedor;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacion: any = '';

  isValid = false;

  showInfo: boolean = true;
  showActividad: boolean = false;
  showGuardar: boolean = false;
  showInactivo: boolean = true;
  modificable: boolean = true;
  estadoEntidad: boolean = true;
  inactivoSinAsociacion: boolean = true;

  lstProveedor: any = {};

  seleccionClienteProveedor: ClienteProveedor[] = [];

  form: CrearFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };

  pasoActivoIndex: number = 1;
  readonly pasos: PasosCrud = makeProveedorEditar();

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.pasoActivoIndex = 1;
    this.buscarProveedor();
  }

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleInactivo() {}

  handleGuardar() {
    this.dialogConfirmacionGuardar = false;

    let clientesSeleccionados = this.seleccionClienteProveedor.map(
      lista => lista.id
    );
    if (!this.showInactivo) {
      clientesSeleccionados = [];
    }
    let formulario: any = this.form.entity;

    let nuevoProveedor = {
      id: this.proveedorSeleccionado.id,
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
    return editarProveedor(nuevoProveedor)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar crear el Proveedor de GPS',
          { timeout: 3000 }
        )
      )
      .then(() => {
        this.$snotify.success(
          `Los cambios han sido guardados de forma exitosa`,
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

  async handleFormChange(event: FormChangeEvent) {
    // this.pasos.informacionGeneral.formState = event;
    // if (
    //   this.proveedorSeleccionado.clienteProveedorId.length > 0 &&
    //   this.pasos.informacionGeneral.formState.entity.estado == 0
    // ) {
    //   this.modificable = false;
    // } else {
    //   this.modificable = true;
    // }
    // if (this.pasos.informacionGeneral.formState.entity.estado == 0) {
    //   this.estadoEntidad = false;
    // } else {
    //   this.estadoEntidad = true;
    // }

    this.form = event;

    if (this.form.entity.estado == 0) {
      if (this.proveedorSeleccionado.clienteProveedorId.length !== 0) {
        this.modificable = false;
      } else {
        this.modificable = true;
      }
      this.estadoEntidad = false;
    } else {
      this.modificable = true;
      this.estadoEntidad = true;
      this.inactivoSinAsociacion = true;
    }

    // if (
    //   this.form.entity.estado == 0 &&
    //   (this.proveedorSeleccionado.clienteProveedorId.length !== 0)
    // ) {
    //   this.estadoEntidad = true;
    //   this.modificable = false;
    // } else {
    //   this.estadoEntidad = false;
    //   this.modificable = true;
    // }

    this.pasos.informacionGeneral.formState = event;

    if (this.form.isDirty) {
      this.isValid = await this.form.validator.validateAll();
    }
    if (this.form.entity.estado == 0) {
      this.showInactivo = false;
    } else {
      this.showInactivo = true;
    }
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

  async buscarProveedor() {
    this.lstProveedor = (await this.fetchProveedor()) || {};
    this.showGuardar = true;
  }

  fetchProveedor() {
    this.loadingService.showLoading();
    return fetchProveedor(this.proveedorSeleccionado.id)
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los Proveedores de GPS',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>
