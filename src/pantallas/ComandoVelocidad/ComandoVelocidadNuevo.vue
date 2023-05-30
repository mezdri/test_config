<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear
      :titulo="'Configurar Velocidad Máxima'"
      @cerrar="handleCerrar"
    >
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        @guardar="handleGuardar"
      />
    </CabeceraModalCrear>
    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />

      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.asociarVelocidad">
          <ComandoVelocidadAsignacion
            :col-def-vehiculo="vehiculoColDefs"
            @handleFormChangeEventosVelocidad="handleFormChangeEventosVelocidad"
          />
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
        $t('mensajes.crud.crear.titulo', {
          entidad: 'Umbral de Velocidad Máxima',
        })
      "
      :mensaje="mensajeConfirmacion"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>

    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="tituloValidacion"
      :mensaje="mensajeValidacion"
      :items="itemsNoValidos"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
    <v-dialog v-model="showValidacionLineal" persistent max-width="380">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title
            style="font-size: 17px; margin-left: 10px !important"
            >{{ tituloValidacion }}</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text>
          <span>Debe ingresar:</span>
          <br />
          <br />
          <ul>
            <li v-for="ce in camposZonaEmpty" :key="ce">{{ ce }}</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small color="primary" @click="showValidacionLineal = false"
            >Aceptar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { FormChangeEvent } from '@/reusable/Form/formUtils';

import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import Confirmation from '@/components/Confirmation.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';

import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';

import ComandoVelocidadAsignacion from '@/pantallas/ComandoVelocidad/ComandoVelocidadAsignacion.vue';

import { ColDef } from 'ag-grid-community';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { table } from 'console';

@Component({
  components: {
    CabeceraModalCrear,
    ModalMantenedor,
    GuardarButton,
    Confirmation,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    MensajeValidacion,
    AsociarFlotaEtiquetaVehiculoIndividual,
    ComandoVelocidadAsignacion,
  },
})
export default class ComandoVelocidadNuevo extends Vue {
  @Prop({ required: true }) show: boolean;

  pasoActivoIndex = 1;

  readonly pasos: PasosCrud = {
    asociarVelocidad: {
      accion: 'Crear - Asociar Flotas Etiquetas o Vehículos',
      visible: true,
      step: 1,
      title: 'Seleccionar Velocidad Máxima',
      icon: 'directions_car',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
    asociarVehiculos: {
      accion: 'Crear - Asociar Flotas Etiquetas o Vehículos',
      visible: true,
      step: 2,
      title: 'Asociar Flotas Etiquetas o Vehículos',
      icon: 'directions_car',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  asignacionVelocidad: number;
  dialogConfirmacionClose: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  mensajeConfirmacion: any = '';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionGuardar: boolean = false;

  /* validacion */
  showValidacion: boolean = false;
  showValidacionLineal: boolean = false;
  tituloValidacion: any = '';
  mensajeValidacion: any = '';
  itemsNoValidos: string[] = [];
  isValidCamposZonas = true;
  showAsociarVehiculos = true;
  camposZonaEmpty: any = '';

  asociacionesVehiculos: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };

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
  axiosFiltroVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);

  constructor() {
    super();
    this.pasos.asociarVelocidad.permitirContinuar = this.PermiteAsociarVelocidadEvento;
    this.pasos.asociarVehiculos.permitirContinuar = this.PermiteContinuarAsociarVehiculo;
  }

  handleCerrar() {
    this.pasoActivoIndex = 1;
    this.asignacionVelocidad = null;
    this.dialogConfirmacionGuardar = false;
    this.$emit('modalAsociacionEmit', false);
  }

  handleAsociacionesChange(
    event: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent
  ) {
    this.asociacionesVehiculos = event;
  }

  PermiteAsociarVelocidadEvento() {
    if (this.asignacionVelocidad != null && this.asignacionVelocidad >= 0) {
      return true;
    } else {
      this.$snotify.warning('No se ha ingresado una velocidad máxima', {
        timeout: 2000,
      });
      return false;
    }
  }

  PermiteContinuarAsociarVehiculo() {
    var existeVFE =
      this.asociacionesVehiculos.vehiculos.length +
      this.asociacionesVehiculos.flotas.length +
      this.asociacionesVehiculos.etiquetas.length;

    if (existeVFE > 0) {
      return true;
    } else {
      this.$snotify.warning(
        'No existe elementos para asociar velocidad máxima',
        {
          timeout: 2000,
        }
      );
      return false;
    }
  }

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  //desde aca //

  // en formulario se crea evento con nombre @handleFormChangeEventosVelocidad
  handleFormChangeEventosVelocidad(x: number) {
    this.asignacionVelocidad = x;
  }

  async handleConfirmacionGuardar(isConfirm: boolean) {
    var lsVehiculo = null;
    //this.dialogConfirmacionGuardar = false;
    console.log('handleConfirmacionGuardar' + isConfirm);
    if (isConfirm) {
      this.loadingService.showLoading();

      if (typeof this.asignacionVelocidad === 'undefined') {
        this.asignacionVelocidad = 0;
      }

      try {
        lsVehiculo = [];
        if (this.asociacionesVehiculos.vehiculos.length) {
          lsVehiculo = [];
          for (
            let z = 0;
            z < this.asociacionesVehiculos.vehiculos.length;
            z++
          ) {
            lsVehiculo.push({
              Id: this.asociacionesVehiculos.vehiculos[z].id,
              VelocidadMaxima: this.asignacionVelocidad,
              TipoID: 'V',
            });
          }
        }
        if (this.asociacionesVehiculos.flotas.length) {
          for (let z = 0; z < this.asociacionesVehiculos.flotas.length; z++) {
            lsVehiculo.push({
              Id: this.asociacionesVehiculos.flotas[z].id,
              VelocidadMaxima: this.asignacionVelocidad,
              TipoID: 'F',
            });
          }
        }

        if (this.asociacionesVehiculos.etiquetas.length) {
          for (
            let z = 0;
            z < this.asociacionesVehiculos.etiquetas.length;
            z++
          ) {
            lsVehiculo.push({
              Id: this.asociacionesVehiculos.etiquetas[z].id,
              VelocidadMaxima: this.asignacionVelocidad,
              TipoID: 'E',
            });
          }
        }

        //  console.table(lsVehiculo);
        let responsesaveRutaVehiculo = await this.axiosFiltroVehiculo.http.post(
          'VelocidadMaxima/GrabaComunicacionVehiculo',
          lsVehiculo
        );
      } catch (error) {
        this.$snotify.error(
          'Ha ocurrido un error al intentar enviar la valocidad máxima',
          {
            timeout: 3000,
          }
        );
      } finally {
        this.loadingService.hideLoading();
        this.$snotify.success(
          'La velocidad máxima se ha asignado de forma exitosa',
          {
            timeout: 3000,
          }
        );
        this.handleCerrar();
      }
    } else {
      this.dialogConfirmacionGuardar = false;
    }
  }

  async handleGuardar() {
    const isValid = true;

    this.mensajeConfirmacion =
      '¿Está seguro que desea asignar la velocidad máxima? ';

    if (isValid) {
      this.dialogConfirmacionGuardar = true;
    }
  }
}
</script>
