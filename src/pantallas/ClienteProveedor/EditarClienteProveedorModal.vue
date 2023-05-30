<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      :titulo="'Editar Cliente Proveedor de GPS'"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      @inactivo="handleInactivo"
      :inactivable="modificable"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :estadoEntidad="estadoEntidad"
      :inactivoSinAsociacion="inactivoSinAsociacion"
      :nombreEntidad="
        clienteProveedorSeleccionado ? clienteProveedorSeleccionado.nombre : ''
      "
      :entidad="'Cliente Proveedor de GPS'"
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />
    <ContenidoModal>
      <ClienteProveedorForm
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
        @change="handleFormChange"
        :nuncaEdit="true"
        :clienteProveedorSeleccionado="lstClienteProveedor.data"
      />
      <ProveedorGrid
        v-show="pasoActivoIndex === pasos.asociarClienteProveedor.step"
        @change="handleProveedoresChange"
        :clienteProveedorSeleccionado="lstClienteProveedor.data"
        :proveedores="lstProveedores"
        :esEditar="true"
        :idCliente="
          clienteProveedorSeleccionado ? clienteProveedorSeleccionado.id : 0
        "
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
import { LoadingService } from '@/services/loadingService';

import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';

import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import Confirmation from '@/components/Confirmation.vue';
import config from '@/config/index';

import ClienteProveedorForm from '@/pantallas/ClienteProveedor/ClienteProveedorForm.vue';
import ProveedorGrid from '@/pantallas/ClienteProveedor/ProveedorGrid.vue';
import { crearCalibracion } from '@/pantallas/CalibracionVehiculo/Services/crearCalibracion';

import { FormChangeEvent } from '@/reusable/Form/formUtils';
import moment from 'moment';
import {
  ClienteProveedor,
  makeClienteProveedorPasosEditar,
} from './ClienteProveedor';
import { Proveedor } from '@/pantallas/Proveedor/Proveedor';
import { crearClienteProveedor } from '@/pantallas/ClienteProveedor/crearClienteProveedor';
import { fetchClienteProveedor } from '@/pantallas/ClienteProveedor/fetchClienteProveedor';
import { editarClienteProveedor } from '@/pantallas/ClienteProveedor/editarClienteProveedor';

import { fetch as fetchProveedoresGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { fetchAsociacionCliente } from '@/pantallas/ClienteProveedor/fetchAsociacion';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

type CrearFormState = {
  entity: ClienteProveedor;
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
    ClienteProveedorForm,
    ProveedorGrid,
    CrudStepsNavBar,
    ContenidoModal,
  },
})
export default class EditarClienteProveedorModal extends OperacionCrud {
  @Prop({ required: true }) show: boolean;
  @Prop({ required: true }) clienteProveedorSeleccionado: ClienteProveedor;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  pasoActivoIndex: number = 1;
  readonly funcionalidad: Funcionalidades = Funcionalidades.ClienteProveedor;
  readonly pasos: PasosCrud = makeClienteProveedorPasosEditar();

  dialogConfirmacionClose: boolean = false;
  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacion: any = '';

  showGuardar: boolean = true;
  showInactivo: boolean = true;
  modificable: boolean = true;
  lstClienteProveedor: any = {};

  showInfo: boolean = true;
  showActividad: boolean = false;
  estadoEntidad: boolean = true;
  inactivoSinAsociacion: boolean = true;

  isValid = false;
  seleccionProveedor: Proveedor[] = [];
  lstProveedores: Proveedor[] = [];

  form: CrearFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.pasoActivoIndex = 1;
    this.buscarClienteProveedor();
    this.cargarProveedores();
  }

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleInactivo() {}

  handleGuardar() {
    this.dialogConfirmacionGuardar = false;

    let proveedorSeleccionados = this.seleccionProveedor.map(lista => lista.id);
    if (!this.showInactivo) {
      proveedorSeleccionados = [];
    }
    let formulario: any = this.form.entity;

    let nuevoClienteProveedor = {
      id: this.clienteProveedorSeleccionado.id,
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
    return editarClienteProveedor(nuevoClienteProveedor)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar crear Cliente Proveedor de GPS',
          { timeout: 3000 }
        )
      )
      .then(() => {
        this.$snotify.success(
          'Los cambios han sido guardados de forma exitosa',
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
    this.form = event;

    if (this.form.entity.estado == 0) {
      if (this.lstClienteProveedor.data.proveedorId.length !== 0) {
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
    //   this.lstClienteProveedor.data.proveedorId.length !== 0 //aqui hay arreglr
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

    // this.form = event;
    // let asociacionRecepcion = await fetchAsociacionCliente(
    //   this.clienteProveedorSeleccionado.id
    // );
    // this.pasos.informacionGeneral.formState = event;
    // if (this.form.entity.estado == 0) {
    //   this.showInactivo = false;
    // } else {
    //   this.showInactivo = true;
    // }

    // if (
    //   this.lstClienteProveedor.data.estado == 1 &&
    //   this.form.entity.estado == 0 &&
    //   (this.lstClienteProveedor.data.proveedorId.length !== 0 ||
    //     asociacionRecepcion.data)
    // ) {
    //   this.modificable = false;
    // } else {
    //   this.modificable = true;
    // }
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.handleCerrar();
    }
  }

  handleProveedoresChange(actividadMantenimiento: Proveedor[]) {
    this.seleccionProveedor = actividadMantenimiento;
    this.showGuardar = false;
  }

  async buscarClienteProveedor() {
    this.lstClienteProveedor = (await this.fetchClienteProveedor()) || {};
  }

  async cargarProveedores() {
    this.lstProveedores = (await this.fetchProveedores()) || [];
  }

  fetchClienteProveedor() {
    this.loadingService.showLoading();
    return fetchClienteProveedor(this.clienteProveedorSeleccionado.id)
      .catch(error => {
        if (error.response.status != 404) {
          this.$snotify.error(
            'Ha ocurrido un error al intentar obtener los Clientes Proveedores de GPS',
            { timeout: 3000 }
          );
        }
      })
      .finally(() => this.loadingService.hideLoading());
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
