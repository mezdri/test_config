<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Proveedor de GPS"
      @cerrar="handleCerrar"
    ></CabeceraModal>
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <ProveedorForm
        :proveedorSeleccionado="lstProveedor.data"
        :modoVer="true"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
      <ClienteProveedorGrid
        :modoVer="true"
        :proveedorSeleccionado="lstProveedor.data"
        v-show="pasoActivoIndex === pasos.asociarProveedor.step"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ProveedorForm from '@/pantallas/Proveedor/ProveedorForm.vue';
import ClienteProveedorGrid from '@/pantallas/Proveedor/ClienteProveedorGrid.vue';

import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

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
  Proveedor,
  makeProveedorVerDetalle,
} from '@/pantallas/Proveedor/Proveedor';
import { fetchProveedor } from '@/pantallas/Proveedor/fetchProveedor';

import { ClienteProveedor } from '../ClienteProveedor/ClienteProveedor';
import { fetchClientesProveedorGps } from '@/reusable/proveedorGps/fetchClientesProveedorGps';

import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';

type CrearPautaActividadFormState = {
  entity: Proveedor;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    CabeceraModal,
    ProveedorForm,
    ModalMantenedor,
    ClienteProveedorGrid,
    CrudStepsNavBar,
    ContenidoModal,
  },
})
export default class VerDetallePautaActividadModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) proveedorSeleccionado: Proveedor;

  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.Proveedor;

  pasoActivoIndex: number = 1;
  readonly pasos: PasosCrud = makeProveedorVerDetalle();

  lstProveedor: any = {};

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.pasoActivoIndex = 1;
    this.buscarProveedor();
  }

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */
  handleCerrar() {
    this.$emit('cerrar');
  }

  async buscarProveedor() {
    this.lstProveedor = (await this.fetchProveedor()) || {};
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
