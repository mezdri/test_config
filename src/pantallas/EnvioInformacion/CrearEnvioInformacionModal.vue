<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear
      titulo="Crear Envío de Información"
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
          <InformacionGeneralForm @change="handleFormChange" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarVehiculos">
          <AsociarFlotaEtiquetaVehiculoIndividual
            :col-def-vehiculo="vehiculoColDefs"
            @change="handleAsociacionesChange"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>
    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'Envío de Información' })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="confirmCallback($event)"
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
import Vue from 'vue';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEntidad, TipoAlertaBase } from '@/config/enums';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { Validator } from 'vee-validate';

import config from '@/config/index';
import Confirmation from '@/components/Confirmation.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';

import {
  Etiqueta,
  Flota,
  Vehiculo,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';
import AsociarFlotaEtiquetaVehiculo, {
  AsociarFlotaEtiquetaVehiculoChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotaEtiquetaVehiculo.vue';

import { ColDef } from 'ag-grid-community';

import InformacionGeneralForm from '@/pantallas/EnvioInformacion/InformacionGeneralForm.vue';

import { Envio, makePasosCrear, EnvioBackend } from '@/interfaces/Envio';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '../../reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';
import moment from 'moment';

@Component({
  components: {
    Confirmation,
    ModalMantenedor,
    CabeceraModalCrear,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    NavegacionModalCrud,
    InformacionGeneralForm,
    AsociarFlotaEtiquetaVehiculo,
    MensajeValidacion,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class CrearEnvioInformacionModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.EnvioDeInformacion;
  readonly pasos: PasosCrud = makePasosCrear();

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

  // Variables Globales
  readonly $snotify: Snotify;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  loadingService = new LoadingService();
  dialogConfirmacionGuardar: boolean = false;
  pasoActivoIndex: number = 1;

  /* validacion */
  showValidacion: boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';

  mensajeConfirmacionInactivo: any = '';

  asociaciones: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };

  constructor() {
    super();
    this.pasos.asociarVehiculos.permitirContinuar = this.permiteContinuarVehiculos;
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.$validator.reset();
  }

  handleCerrar() {
    this.pasoActivoIndex = 1;
    this.$validator.reset();
    this.$emit('cerrar');
  }

  async handleGuardarClick() {
    if (this.pasos.informacionGeneral.formState.entity.estado == 0) {
      this.mensajeConfirmacionInactivo =
        'Al dejar como inactivo, no se permitirá enviar información. ¿Está seguro que desea crear el Envío de Información?';
    } else {
      this.mensajeConfirmacionInactivo = this.$t(
        'mensajes.crud.crear.mensaje',
        { entidad: 'el Envío de Información' }
      );
    }
    this.dialogConfirmacionGuardar = true;
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacionGuardar = false;
    var envio: EnvioBackend;

    const mergeDiaHora = (dia: moment.Moment | null, hora: moment.Moment) => {
      if (dia === null) {
        return dia;
      }
      return hora ? dia.hour(hora.hour()).minute(hora.minute()) : dia;
    };

    if (val) {
      this.loadingService.showLoading();
      if (this.pasos.informacionGeneral.formState.entity.estado == 0) {
        envio = {
          ...this.pasos.informacionGeneral.formState.entity,
          flotas: [],
          etiquetas: [],
          vehiculos: [],
        };
      } else {
        envio = {
          ...this.pasos.informacionGeneral.formState.entity,
          flotas: this.asociaciones.flotas.map((x: Flota) => x.id),
          etiquetas: this.asociaciones.etiquetas.map((x: Etiqueta) => x.id),
          vehiculos: this.asociaciones.vehiculos.map((x: Vehiculo) => x.id),
        };
      }

      const {
        fechaIni,
        fechaFin,
        horaIni,
        horaFin,
      } = this.pasos.informacionGeneral.formState.entity;

      envio.fechaIni = mergeDiaHora(
        fechaIni as moment.Moment,
        horaIni as moment.Moment
      ).format();
      envio.fechaFin =
        fechaFin === null
          ? null
          : mergeDiaHora(
              fechaFin as moment.Moment,
              horaFin as moment.Moment
            ).format();

      this.axios.http
        .post('Integracion/Envio', envio)
        .then(() => {
          this.$snotify.success(
            this.$t('mensajes.mensajesExito.crear', {
              entidad: 'Envío de Información',
              creadoA: 'creado',
            })
          );
          this.$emit('crear');
        })
        .catch(() =>
          this.$snotify.error(
            this.$t('mensajes.mensajesError.crear', {
              entidad: 'Envío de Información',
            })
          )
        )
        .finally(() => this.loadingService.hideLoading());
    }
  }

  get estadoId() {
    const { entity } = this.pasos.informacionGeneral.formState;
    if (!entity) {
      return null;
    }
    return entity.estado;
  }

  /* Informacion general */

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  /* Asociar Vehiculos */

  handleAsociacionesChange(
    event: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent
  ) {
    this.asociaciones = event;
  }

  permiteContinuarVehiculos() {
    if (
      !this.asociaciones.vehiculos.length &&
      !this.asociaciones.etiquetas.length &&
      !this.asociaciones.flotas.length
    ) {
      this.tituloValidacion = 'Asociar Vehículo';
      this.mensajeValidacion = 'Debe seleccionar al menos un Vehículo.';
      this.showValidacion = true;
      return false;
    }
    return true;
  }
}
</script>
