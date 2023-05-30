<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Envío de Información"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @cerrar="handleCerrar"
      @guardar="handleGuardar"
      :pasos="pasos"
      entidad="Envío de Información"
      :estadoEntidad="estadoEntidad"
      :inactivable="modificable"
      @inactivo="handleInactivo"
      :nombreEntidad="''"
      :pasoActivoIndex="pasoActivoIndex"
      :mensajeInactivo="mensajeInactivo"
    />
    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />
    <ContenidoModal>
      <InformacionGeneralForm
        @change="handleFormChange"
        :envio="envio"
        :modoEditar="true"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
      <AsociarFlotaEtiquetaVehiculoIndividual
        @change="handleAsociacionesChange"
        :flotas-id-seleccionar="envio && envio.flotas"
        :etiquetas-id-seleccionar="envio && envio.etiquetas"
        :vehiculos-id-seleccionar="envio && envio.vehiculos"
        :col-def-vehiculo="vehiculoColDefs"
        v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
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
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { Snotify } from '@/snotify/Snotify';
import { LoadingService } from '@/services/loadingService';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import {
  Etiqueta,
  Flota,
  Vehiculo,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/fetchFlotasEtiquetasVehiculos';

import { ColDef } from 'ag-grid-community';

import InformacionGeneralForm from '@/pantallas/EnvioInformacion/InformacionGeneralForm.vue';

import { fetchByIdEnvio } from '@/pantallas/EnvioInformacion/Services/fetchByIdEnvio';
import { Envio, makePasosEditar, EnvioBackend } from '@/interfaces/Envio';
import { FormChangeEvent } from '@/reusable/Form/formUtils';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import Confirmation from '@/components/Confirmation.vue';
import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '../../reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';
import moment from 'moment';

@Component({
  components: {
    ContenidoModal,
    CrudStepsNavBar,
    ModalMantenedor,
    CabeceraModalEditar,
    InformacionGeneralForm,
    Confirmation,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class EditarDetalleEnvioInformacionModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) id: number;

  readonly $snotify: Snotify;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Integracion);
  loadingService = new LoadingService();

  /* template */
  pasoActivoIndex: number = 1;
  readonly funcionalidad: Funcionalidades = Funcionalidades.EnvioDeInformacion;
  readonly pasos: PasosCrud = makePasosEditar();

  /* validacion */
  permiteContinuarConfirm: boolean = false;
  tituloPermiteContinuar: string = '';
  mensajePermiteContinuar: string = '';
  itemsNoValidos: string[] = [];

  mensajeInactivo: string =
    'Al dejar como inactivo, no se permitirá enviar información.';

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

  estadoEntidad: boolean = true;
  modificable: boolean = true;

  envio: Envio | void = null;
  asociaciones: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };

  constructor() {
    super();
    this.pasos.informacionGeneral.permitirContinuar = this.permiteContinuarInformacionGeneral;
    this.pasos.asociarVehiculos.permitirContinuar = this.permiteContinuarVehiculos;
  }

  async mounted() {
    this.envio = await this.fetchByIdEnvio();
  }

  fetchByIdEnvio() {
    this.loadingService.showLoading();
    return fetchByIdEnvio(this.id)
      .catch(() => {
        this.$snotify.error(
          this.$t('mensajes.mensajesError.consulta', {
            entidad: 'el servicio de envio',
          })
        );
        return;
      })
      .finally(() => this.loadingService.hideLoading());
  }

  /* event handlers */

  handleGuardar() {
    var envio: EnvioBackend;
    var isCamposValidos = true;

    const mergeDiaHora = (dia: moment.Moment | null, hora: moment.Moment) => {
      if (dia === null) {
        return dia;
      }
      return hora ? dia.hour(hora.hour()).minute(hora.minute()) : dia;
    };

    envio = {
      ...this.pasos.informacionGeneral.formState.entity,
      id: this.id,
      flotas: this.asociaciones.flotas.map((x: Flota) => x.id),
      etiquetas: this.asociaciones.etiquetas.map((x: Etiqueta) => x.id),
      vehiculos: this.asociaciones.vehiculos.map((x: Vehiculo) => x.id),
    };

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

    isCamposValidos = this.permiteContinuarVehiculos();

    if (isCamposValidos) {
      this.loadingService.showLoading();

      this.axios.http
        .put('Integracion/Envio', envio)
        .then(() => {
          this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
          this.$emit('guardar');
        })
        .catch(() =>
          this.$snotify.error(this.$t('mensajes.mensajesError.editar'))
        )
        .finally(() => this.loadingService.hideLoading());
    }
  }

  handleCerrar() {
    this.$emit('cerrar');
  }

  /* Informacion general */

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
    if (this.pasos.informacionGeneral.formState.entity.estado == 0) {
      this.modificable = true;
      this.estadoEntidad = false;
    } else {
      this.modificable = true;
      this.estadoEntidad = true;
    }
  }

  permiteContinuarInformacionGeneral(): boolean {
    const { entity } = this.pasos.informacionGeneral.formState;
    var fechaInicio = entity.fechaIni;
    var fechaTermino = entity.fechaFin;

    if (fechaInicio) {
      if (fechaTermino) {
        if (fechaInicio >= fechaTermino) {
          this.$snotify.error(
            'Fecha de Término debe ser mayor a la Fecha de Inicio'
          );
          return false;
        }
      }
      return true;
    }
    return true;
  }

  /* Asociar Vehiculos */

  handleAsociacionesChange(
    event: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent
  ) {
    this.asociaciones = event;
  }

  permiteContinuarVehiculos() {
    this.itemsNoValidos = [];

    if (this.pasos.informacionGeneral.formState.entity.estado !== 0) {
      if (
        !this.asociaciones.vehiculos.length &&
        !this.asociaciones.etiquetas.length &&
        !this.asociaciones.flotas.length
      ) {
        this.tituloPermiteContinuar = 'Editar Envío de Información';
        this.mensajePermiteContinuar = 'Debe completar el siguiente campo:';
        this.itemsNoValidos.push('Asociar Vehículos');
        this.permiteContinuarConfirm = true;
        return false;
      }
    }
    return true;
  }

  handleInactivo() {}
}
</script>
