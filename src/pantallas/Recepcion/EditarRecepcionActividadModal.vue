<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      :titulo="`Editar Recepción de Información`"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      :entidad="'Recepción de Información'"
      :estadoEntidad="estadoEntidad"
      :inactivable="modificable"
      @inactivo="handleInactivo"
      :nombreEntidad="
        pasos.informacionGeneral.formState.entity
          ? pasos.informacionGeneral.formState.entity.nombre
          : ''
      "
      :mensajeInactivo="mensajeInactivo"
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />

    <ContenidoModal>
      <RecepcionActividadForm
        @change="handleFormChange"
        test-id="EditarRecepcionActividadModal"
        :recepcionActividad="recepcionActividad"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
        :edicion="true"
      />
      <AsociarFlotaEtiquetaVehiculoIndividual
        :flotas-id-seleccionar="
          recepcionActividadDetalle && recepcionActividadDetalle.flotasId
        "
        :etiquetas-id-seleccionar="
          recepcionActividadDetalle && recepcionActividadDetalle.etiquetasId
        "
        :vehiculos-id-seleccionar="
          recepcionActividadDetalle && recepcionActividadDetalle.vehiculosId
        "
        @change="handleAsociacionesChange"
        v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
        :col-def-vehiculo="vehiculoColDefs"
        :esEditar="true"
        :filtroGps="true"
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

import RecepcionActividadForm, {
  RecepcionActividadFormState,
} from '@/pantallas/Recepcion/RecepcionActividadForm.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import {
  makeRecepcionActividadPasosEditar,
  RecepcionActividad,
} from '@/pantallas/Recepcion/RecepcionActividad';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import {
  fetchRecepcionActividad,
  RecepcionActividadDetalle,
} from '@/pantallas/Recepcion/fetchRecepcionActividad';
import { editarRecepcionActividad } from '@/pantallas/Recepcion/editarRecepcionActividad';
import {
  Etiqueta,
  Flota,
  Vehiculo,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';
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
import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '../../reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';

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
    RecepcionActividadForm,
    Confirmation,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class EditarRecepcionActividadModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) recepcionActividad: RecepcionActividad;

  /* template */

  recepcionActividadDetalle: RecepcionActividadDetalle | void = null;
  pasoActivoIndex = 1;
  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.RecepcionDeActividades;
  readonly pasos: PasosCrud = makeRecepcionActividadPasosEditar();

  estadoEntidad: boolean = true;
  modificable: boolean = true;

  /* validacion */
  permiteContinuarConfirm: boolean = false;
  tituloPermiteContinuar: string = '';
  mensajePermiteContinuar: string = '';
  itemsNoValidos: string[] = [];
  mensajeInactivo: string =
    'Al dejar como inactivo, no se permitirá recibir información.';

  // TODO extraer
  vehiculoColDefs: ColDef[] = [
    {
      headerName: 'Unidad',
      field: 'unidad',
      lockVisible: true,
      lockPinned: true,
    },
    {
      headerName: 'Flota',
      field: 'flota.nombre',
    },
  ];

  asociaciones: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();
    // this.pasos.informacionGeneral.permitirContinuar = this.permiteContinuarInformacionGeneral;
    this.pasos.asociarVehiculos.permitirContinuar = this.permiteContinuarAsociarVehiculos;
  }

  /* lifecycle hooks */

  async mounted() {
    this.recepcionActividadDetalle = await this.fetchRecepcionActividad();
  }

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    var isCamposValidos = true;
    let arrayFlotasId = this.asociaciones.flotas.map((x: Flota) => x.id);
    let arrayEtiquetasId = this.asociaciones.etiquetas.map(
      (x: Etiqueta) => x.id
    );
    let arrayVehiculosId = this.asociaciones.vehiculos.map(
      (x: Vehiculo) => x.id
    );

    isCamposValidos = this.permiteContinuarAsociarVehiculos();

    if (isCamposValidos) {
      this.loadingService.showLoading();

      editarRecepcionActividad({
        ...this.pasos.informacionGeneral.formState.entity,
        id: this.recepcionActividad.id,
        flotasId: arrayFlotasId,
        etiquetasId: arrayEtiquetasId,
        vehiculosId: arrayVehiculosId,
      })
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

  handleFormChange(event: RecepcionActividadFormState) {
    this.pasos.informacionGeneral.formState = event;
    if (this.pasos.informacionGeneral.formState.entity.estado.id == 0) {
      this.modificable = true;
      this.estadoEntidad = false;
    } else {
      this.modificable = true;
      this.estadoEntidad = true;
    }
  }

  handleAsociacionesChange(
    event: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent
  ) {
    this.asociaciones = event;
  }

  handleInactivo() {}
  /* misc */

  fetchRecepcionActividad() {
    this.loadingService.showLoading();
    return fetchRecepcionActividad(this.recepcionActividad)
      .catch(() => {
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener esta recepción de actividades',
          { timeout: 3000 }
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  permiteContinuarAsociarVehiculos(): boolean {
    this.itemsNoValidos = [];
    if (this.pasos.informacionGeneral.formState.entity.estado.id !== 0) {
      if (!this.asociaciones.vehiculos.length) {
        this.tituloPermiteContinuar = 'Editar Recepción de Información';
        this.mensajePermiteContinuar = 'Debe completar el siguiente campo:';
        this.itemsNoValidos.push('Asociar Vehículos');
        this.permiteContinuarConfirm = true;
        return false;
      }
    }
    return true;
  }
}
</script>
