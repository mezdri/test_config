<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Descarga de Información"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      entidad="Descarga de Información"
      :paso-activo-index="pasoActivoIndex"
      @inactivo="handleInactivo"
      :inactivable="modificable"
      :estadoEntidad="estadoEntidad"
      :mensajeInactivo="mensajeInactivo"
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />

    <ContenidoModal v-if="descargaActividadDetalle">
      <DescargaActividadForm
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
        :descarga-actividad="descargaActividadDetalle"
        @change="handleInformacionGeneralChange"
        :edicion="true"
        :idServicio="descargaActividad.id"
        test-id="EditarDescargaActividadModal"
      />
      <AsociarFlotaEtiquetaVehiculoIndividual
        :flotas-id-seleccionar="
          descargaActividadDetalle && descargaActividadDetalle.flotasId
        "
        :etiquetas-id-seleccionar="
          descargaActividadDetalle && descargaActividadDetalle.etiquetasId
        "
        :vehiculos-id-seleccionar="
          descargaActividadDetalle && descargaActividadDetalle.vehiculosId
        "
        @change="handleAsociacionesChange"
        v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
        :col-def-vehiculo="vehiculoColDefs"
        :esEditar="true"
      />
      <PasoAsociacion
        v-show="pasoActivoIndex === pasos.asociarActividades.step"
      >
        <AsociarTiposActividad
          v-model="descargaActividadDetalle.tiposActividadId"
          :esEditar="true"
        />
      </PasoAsociacion>
      <PasoAsociacion
        v-show="pasoActivoIndex === pasos.asociarDispositivos.step"
        :esEditar="true"
      >
        <AsociarDispositivos
          v-model="descargaActividadDetalle.dispositivosId"
          :esEditar="true"
        />
      </PasoAsociacion>
      <AsociarCampos
        v-show="pasoActivoIndex === pasos.seleccionarCampos.step"
        v-model="descargaActividadDetalle.camposId"
        :esEditar="true"
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
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import {
  DescargaActividad,
  DescargaActividadParcial,
  makeDescargaActividadPasosEditar,
  DescargaActividadGrid,
} from '@/pantallas/DescargaActividades/DescargaActividad';
import { fetchDescargaActividad } from '@/pantallas/DescargaActividades/fetchDescargaActividad';
import { DescargaActividadForm as DescargaActividadFormType } from '@/pantallas/DescargaActividades/crud/DescargaActividadForm';
import DescargaActividadForm from '@/pantallas/DescargaActividades/crud/DescargaActividadForm.vue';
import { GenericFormChangeEvent } from '@/reusable/Form/formUtils';
import { editarDescargaActividad } from '@/pantallas/DescargaActividades/crud/editar/editarDescargaActividad';
import {
  Flota,
  Etiqueta,
  Vehiculo,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';
import { ColDef } from 'ag-grid-community';
import AsociarTiposActividad from '@/pantallas/DescargaActividades/crud/crear/AsociarTiposActividad.vue';
import PasoAsociacion from '@/reusable/Mantenedor/PasoAsociacion.vue';
import AsociarCampos from '@/pantallas/DescargaActividades/crud/crear/AsociarCampos.vue';
import AsociarDispositivos from '@/reusable/Dispositivos/AsociarDispositivos.vue';

import Confirmation from '@/components/Confirmation.vue';

import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';

import { Funcionalidades } from '@/config/funcionalidades';
import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '../../../../reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';

@Component({
  components: {
    AsociarDispositivos,
    AsociarCampos,
    PasoAsociacion,
    AsociarTiposActividad,
    DescargaActividadForm,
    ContenidoModal,
    CrudStepsNavBar,
    GuardarCambiosButton,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
    CabeceraModalEditar,
    ModalMantenedor,
    Confirmation,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class EditarDescargaActividadModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) descargaActividad: DescargaActividadGrid;

  /* template */

  descargaActividadDetalle: DescargaActividad = null;
  pasoActivoIndex = 1;
  readonly pasos = makeDescargaActividadPasosEditar();

  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.Descargas;

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

  asociacionesVehiculos: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  modificable: boolean = true;
  estadoEntidad: boolean = true;

  permiteContinuarConfirm: boolean = false;
  tituloPermiteContinuar: string = '';
  mensajePermiteContinuar: string = '';
  itemsNoValidos: string[] = [];
  mensajeInactivo: string =
    'Al dejar como inactivo, no se permitirá descargar información.';

  /* lifecycle hooks */

  async mounted() {
    this.descargaActividadDetalle =
      (await this.fetchDescargaActividad()) || null;
  }

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  async handleGuardar() {
    const { flotas, etiquetas, vehiculos } = this.asociacionesVehiculos;
    const {
      id,
      dispositivosId,
      tiposActividadId,
      camposId,
    } = this.descargaActividadDetalle;
    var isCamposValidos = true;

    let infoGeneral = this.pasos.informacionGeneral.formState.entity;
    let arrayFlotas = flotas.map((x: Flota) => x.id);
    let arrayEtiquetas = etiquetas.map((x: Etiqueta) => x.id);
    let arrayVehiculos = vehiculos.map((x: Vehiculo) => x.id);
    let arrayDispositivos = dispositivosId;
    let arrayTiposActividadI = tiposActividadId;
    let arrayCamposId = camposId;

    isCamposValidos = this.validaCamposObligatoriosActivo();

    if (isCamposValidos) {
      this.loadingService.showLoading();

      editarDescargaActividad({
        id,
        general: infoGeneral,
        flotasId: arrayFlotas,
        etiquetasId: arrayEtiquetas,
        vehiculosId: arrayVehiculos,
        dispositivosId: arrayDispositivos,
        tiposActividadId: arrayTiposActividadI,
        camposId: arrayCamposId,
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

  handleInformacionGeneralChange(
    event: GenericFormChangeEvent<DescargaActividadFormType>
  ) {
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
    this.asociacionesVehiculos = event;
  }

  /* misc */

  fetchDescargaActividad() {
    this.loadingService.showLoading();
    return fetchDescargaActividad(this.descargaActividad)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener esta descarga de actividades'
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  handleInactivo() {}

  validaCamposObligatoriosActivo() {
    this.itemsNoValidos = [];

    this.tituloPermiteContinuar = 'Editar Descarga de Información';
    this.mensajePermiteContinuar = 'Debe completar los siguientes campos:';

    if (this.pasos.informacionGeneral.formState.entity.estado.id !== 0) {
      //MapeoColumna
      if (this.descargaActividadDetalle.camposId.length == 0) {
        this.itemsNoValidos.push('Seleccionar Campos');
      }

      //Mapeo Respuesta
      if (
        this.asociacionesVehiculos.vehiculos.map((x: Vehiculo) => x.id)
          .length == 0
      ) {
        this.itemsNoValidos.push('Asociar Vehículos');
      }

      if (this.itemsNoValidos.length > 0) {
        this.permiteContinuarConfirm = true;
        return false;
      }
    }
    return true;
  }
}
</script>
