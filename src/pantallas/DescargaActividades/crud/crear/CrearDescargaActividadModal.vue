<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear
      titulo="Crear Descarga de Información"
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
          <DescargaActividadForm
            test-id="CrearDescargaActividadModal"
            @change="handleInformacionGeneralChange"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarVehiculos">
          <AsociarFlotaEtiquetaVehiculoIndividual
            :col-def-vehiculo="vehiculoColDefs"
            @change="handleAsociacionesChange"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarActividades">
          <PasoAsociacion>
            <AsociarTiposActividad v-model="idsTipoActividad" />
          </PasoAsociacion>
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarDispositivos">
          <PasoAsociacion>
            <AsociarDispositivos v-model="idsDispositivo" />
          </PasoAsociacion>
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.seleccionarCampos">
          <AsociarCampos v-model="idsCampo" />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.crear.titulo', {
          entidad: 'Descarga de Información',
        })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>
    <Confirmation
      :show="permiteContinuarConfirm"
      :titulo="tituloPermiteContinuar"
      :mensaje="mensajePermiteContinuar"
      :mostrarBoton="false"
      v-on:modalConfirmationEmit="permiteContinuarConfirm = false"
    ></Confirmation>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { GenericFormChangeEvent } from '@/reusable/Form/formUtils';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { makeDescargaActividadPasosCrear } from '@/pantallas/DescargaActividades/DescargaActividad';
import { DescargaActividadForm as DescargaActividadFormType } from '@/pantallas/DescargaActividades/crud/DescargaActividadForm';
import DescargaActividadForm from '@/pantallas/DescargaActividades/crud/DescargaActividadForm.vue';
import AsociarTiposActividad from '@/pantallas/DescargaActividades/crud/crear/AsociarTiposActividad.vue';
import AsociarCampos from '@/pantallas/DescargaActividades/crud/crear/AsociarCampos.vue';
import AsociarDispositivos from '@/reusable/Dispositivos/AsociarDispositivos.vue';
import PasoAsociacion from '@/reusable/Mantenedor/PasoAsociacion.vue';
import { crearDescargaActividad } from '@/pantallas/DescargaActividades/crud/crear/crearDescargaActividad';
import AsociarFlotaEtiquetaVehiculo, {
  AsociarFlotaEtiquetaVehiculoChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotaEtiquetaVehiculo.vue';
import { ColDef } from 'ag-grid-community';
import {
  Flota,
  Etiqueta,
  Vehiculo,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';

import Confirmation from '@/components/Confirmation.vue';

import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';

@Component({
  components: {
    AsociarFlotaEtiquetaVehiculo,
    PasoAsociacion,
    AsociarDispositivos,
    AsociarCampos,
    AsociarTiposActividad,
    DescargaActividadForm,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
    CabeceraModalCrear,
    ModalMantenedor,
    Confirmation,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class CrearDescargaActividadModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;

  /* template */

  pasoActivoIndex = 1;

  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacionInactivo: any = '';

  readonly pasos = makeDescargaActividadPasosCrear();

  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.Descargas;

  asociacionesVehiculos: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };
  idsTipoActividad: number[] = [];
  idsDispositivo: number[] = [];
  idsCampo: number[] = [];
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

  permiteContinuarConfirm: boolean = false;
  tituloPermiteContinuar: string = '';
  mensajePermiteContinuar: string = '';

  constructor() {
    super();
    this.pasos.asociarVehiculos.permitirContinuar = this.permiteContinuarVehiculos;
    this.pasos.seleccionarCampos.permitirContinuar = this.permiteContinuarCampos;
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

    const { flotas, etiquetas, vehiculos } = this.asociacionesVehiculos;
    this.loadingService.showLoading();

    let infoGeneral = this.pasos.informacionGeneral.formState.entity;
    let arrayFlotas = flotas.map((x: Flota) => x.id);
    let arrayEtiquetas = etiquetas.map((x: Etiqueta) => x.id);
    let arrayVehiculos = vehiculos.map((x: Vehiculo) => x.id);
    let arrayDispositivos = this.idsDispositivo;
    let arrayTiposActividadI = this.idsTipoActividad;
    let arrayCamposId = this.idsCampo;

    if (this.pasos.informacionGeneral.formState.entity.estado.id == 0) {
      arrayFlotas = [];
      arrayEtiquetas = [];
      arrayVehiculos = [];
      arrayDispositivos = [];
      arrayTiposActividadI = [];
      arrayCamposId = [];
    }
    crearDescargaActividad({
      general: infoGeneral,
      flotasId: arrayFlotas,
      etiquetasId: arrayEtiquetas,
      vehiculosId: arrayVehiculos,
      dispositivosId: arrayDispositivos,
      tiposActividadId: arrayTiposActividadI,
      camposId: arrayCamposId,
    })
      .then(() => {
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.crear', {
            entidad: 'Descarga de Información',
            creadoA: 'creado',
          })
        );
        this.$emit('crear');
      })
      .catch(() =>
        this.$snotify.error(
          this.$t('mensajes.mensajesError.crear', {
            entidad: 'el Descarga de Información',
          })
        )
      )
      .finally(this.loadingService.hideLoading);
  }

  handleInformacionGeneralChange(
    event: GenericFormChangeEvent<DescargaActividadFormType>
  ) {
    this.pasos.informacionGeneral.formState = event;
  }

  handleAsociacionesChange(
    event: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent
  ) {
    this.asociacionesVehiculos = event;
  }

  get estadoId() {
    const { entity } = this.pasos.informacionGeneral.formState;
    if (!entity) {
      return null;
    }
    return entity.estado.id;
  }

  handleGuardarClick() {
    if (this.pasos.informacionGeneral.formState.entity.estado.id == 0) {
      this.mensajeConfirmacionInactivo =
        'Al dejar como inactivo, no se permitirá descargar información. ¿Está seguro que desea crear la Descarga de Información?';
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'la Descarga de Información' }
      );
    }
    this.dialogConfirmacionGuardar = true;
  }

  permiteContinuarVehiculos() {
    if (
      !this.asociacionesVehiculos.vehiculos.length &&
      !this.asociacionesVehiculos.etiquetas.length &&
      !this.asociacionesVehiculos.flotas.length
    ) {
      this.permiteContinuarConfirm = true;
      this.tituloPermiteContinuar = 'Asociar Vehículos';
      this.mensajePermiteContinuar = 'Debe asociar al menos un Vehículo';
      return false;
    }
    return true;
  }

  permiteContinuarCampos() {
    if (!this.idsCampo.length) {
      this.permiteContinuarConfirm = true;
      this.tituloPermiteContinuar = 'Seleccionar Campos';
      this.mensajePermiteContinuar = 'Debe seleccionar al menos un Campo';
      return false;
    }
    return true;
  }
}
</script>
