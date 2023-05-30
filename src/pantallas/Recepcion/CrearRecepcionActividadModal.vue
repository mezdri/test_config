<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear
      titulo="Crear Recepción de Información"
      @cerrar="handleCerrar"
    >
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
          <RecepcionActividadForm
            test-id="CrearRecepcionActividadModal"
            @change="handleFormChange"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarVehiculos">
          <AsociarFlotaEtiquetaVehiculoIndividual
            :col-def-vehiculo="vehiculoColDefs"
            :filtroGps="true"
            @change="handleAsociacionesChange"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.crear.titulo', {
          entidad: 'Recepción de Información',
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="tituloValidacion"
      :mensaje="mensajeValidacion"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import { crearRecepcionActividad } from '@/pantallas/Recepcion/crearRecepcionActividad';
import RecepcionActividadForm from '@/pantallas/Recepcion/RecepcionActividadForm.vue';
import {
  Etiqueta,
  Flota,
  Vehiculo,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { makeRecepcionActividadPasosCrear } from '@/pantallas/Recepcion/RecepcionActividad';
import { EstadoEntidad } from '@/config/enums';
import Confirmation from '@/components/Confirmation.vue';
import { ColDef } from 'ag-grid-community';

import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '../../reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';

@Component({
  components: {
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
    CabeceraModalCrear,
    RecepcionActividadForm,
    ModalMantenedor,
    Confirmation,
    MensajeValidacion,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class CrearRecepcionActividadModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;

  /* template */

  pasoActivoIndex = 1;
  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.RecepcionDeActividades;
  readonly pasos: PasosCrud = makeRecepcionActividadPasosCrear();
  asociaciones: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };

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
  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacionInactivo: any = '';

  /* validacion */
  showValidacion: boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';

  constructor() {
    super();
    this.pasos.asociarVehiculos.permitirContinuar = this.permiteContinuarVehiculos;
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
    this.loadingService.showLoading();
    const asociaciones = {
      flotasId: this.asociaciones.flotas.map((x: Flota) => x.id),
      etiquetasId: this.asociaciones.etiquetas.map((x: Etiqueta) => x.id),
      vehiculosId: this.asociaciones.vehiculos.map((x: Vehiculo) => x.id),
    };

    crearRecepcionActividad({
      ...this.pasos.informacionGeneral.formState.entity,
      ...(this.estadoId === EstadoEntidad.Activo && asociaciones),
    })
      .then(() => {
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.crear', {
            entidad: 'Recepción de Información',
            creadoA: 'creado ',
          })
        );
        this.$emit('crear');
      })
      .catch(() =>
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', {
            entidad: 'Recepción de Información',
          })
        )
      )
      .finally(this.loadingService.hideLoading);
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  handleAsociacionesChange(
    event: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent
  ) {
    this.asociaciones = event;
  }

  handleGuardarClick() {
    if (this.pasos.informacionGeneral.formState.entity.estado.id == 0) {
      this.mensajeConfirmacionInactivo =
        'Al dejar como inactivo, no se permitirá recibir información. ¿Está seguro que desea crear la Recepción de Información?';
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'la Recepción de Información' }
      );
    }
    this.dialogConfirmacionGuardar = true;
  }

  get estadoId() {
    const { entity } = this.pasos.informacionGeneral.formState;
    if (!entity) {
      return null;
    }
    return entity.estado.id;
  }

  permiteContinuarVehiculos() {
    if (
      !this.asociaciones.vehiculos.length &&
      !this.asociaciones.etiquetas.length &&
      !this.asociaciones.flotas.length
    ) {
      this.tituloValidacion = 'Asociar Vehículos';
      this.mensajeValidacion = 'Debe seleccionar al menos un Vehículo.';
      this.showValidacion = true;
      return false;
    }
    return true;
  }
}
</script>
