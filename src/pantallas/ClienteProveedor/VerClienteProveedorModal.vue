<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Cliente Proveedor de GPS"
      @cerrar="handleCerrar"
    ></CabeceraModal>
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <ClienteProveedorForm
        :clienteProveedorSeleccionado="lstClienteProveedor.data"
        :modoVer="true"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
      <ProveedorGrid
        v-show="pasoActivoIndex === pasos.asociarClienteProveedor.step"
        :modoVer="true"
        :clienteProveedorSeleccionado="lstClienteProveedor.data"
        :proveedores="lstProveedores"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ClienteProveedorForm from '@/pantallas/ClienteProveedor/ClienteProveedorForm.vue';
import ProveedorGrid from '@/pantallas/ClienteProveedor/ProveedorGrid.vue';

import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';

import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import { editarPautaActividad } from '@/pantallas/PautasActividades/editarPautaActividad';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import {
  ClienteProveedor,
  makeClienteProveedorPasosVerDetalle,
} from '@/pantallas/ClienteProveedor/ClienteProveedor';
import { fetchClienteProveedor } from '@/pantallas/ClienteProveedor/fetchClienteProveedor';

import { Proveedor } from '@/pantallas/Proveedor/Proveedor';
import { fetchProveedoresGps } from '@/reusable/proveedorGps/fetchProveedoresGps';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

type CrearPautaActividadFormState = {
  entity: ClienteProveedor;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    CabeceraModal,
    ClienteProveedorForm,
    ModalMantenedor,
    ProveedorGrid,
    CrudStepsNavBar,
    ContenidoModal,
  },
})
export default class VerClienteProveedorModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) clienteProveedorSeleccionado: ClienteProveedor;

  pasoActivoIndex: number = 1;
  readonly funcionalidad: Funcionalidades = Funcionalidades.ClienteProveedor;
  readonly pasos: PasosCrud = makeClienteProveedorPasosVerDetalle();

  lstClienteProveedor: any = {};
  lstProveedores: Proveedor[] = [];

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

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
            'Ha ocurrido un error al intentar obtener el Clientes Proveedor de GPS',
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
