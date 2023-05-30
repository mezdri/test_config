<template>
  <ModalMantenedor :show="show">
    <CabeceraModalCrear
      titulo="Crear Plan de Mantenimiento"
      @cerrar="handleCerrar"
    >
      <NavegacionModalCrud
        v-model="pasoActivoIndex"
        :pasos="pasos"
        @guardar="handleGuardarClick"
      />
    </CabeceraModalCrear>

    <v-stepper v-model="pasoActivoIndex">
      <CrudStepperHeader :pasos="pasos" :paso-activo-index="pasoActivoIndex" />
      <CrudStepperItems>
        <CrudStepperContent :paso="pasos.informacionGeneral">
          <InformacionGeneralForm @change="handleFormChange" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarPauta">
          <AsociarPautaFrecuenciaGrid @change="handlePautasChange" />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.asociarFlotas">
          <AsociarFlotaEtiquetaVehiculo
            @change="handleVehiculosChange"
            :colDefVehiculo="colDefVehiculo"
          />
        </CrudStepperContent>
        <CrudStepperContent :paso="pasos.configurarNotificacion">
          <ConfigurarNotificacion
            @change="handleFormChangeNotificacion"
            @distribucionChange="handleListaDistChange"
            @calendarioChange="handleCalendarioChange"
          />
        </CrudStepperContent>
      </CrudStepperItems>
    </v-stepper>

    <Confirmation
      :show="dialogConfirmacionGuardar"
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'Plan de Mantenimiento' })
      "
      :mensaje="mensajeConfirmacionInactivo"
      v-on:modalConfirmationEmit="handleConfirmacionGuardar"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></Confirmation>

    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="$t(tituloValidacion)"
      :mensaje="$t(mensajeValidacion)"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import InformacionGeneralForm from '@/pantallas/PlanesMantenimiento/InformacionGeneralForm.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import {
  PlanMantenimiento,
  PlanMantenimientoNueva,
  PlanMantenimientoAsociacion,
  PautasPlanesMantenimiento,
  makePlanesPasosCrear,
  DistribucionPlanMantenimiento,
  CalendarioPlanMantenimiento,
  ListaDistribucionPlanMantenimiento,
  ContactosPlanMantenimiento,
} from './Data/PlanMantenimiento';
import { crearPlanMantenimiento } from '@/pantallas/PlanesMantenimiento/Data/crearPlanMantenimiento';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import AsociarPautaFrecuenciaGrid from '@/pantallas/PlanesMantenimiento/AsociarPautaFrecuenciaGrid.vue';
import config from '../../config';
import AsociarFlotaEtiquetaVehiculo, {
  AsociarFlotaEtiquetaVehiculoChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotaEtiquetaVehiculo.vue';
import ConfigurarNotificacion from './ConfigurarNotificacion.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { ColDef } from 'ag-grid-community';
import { checkboxColumnDef } from '../../reusable/Grid/aggridColumnDefUtils';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

type CrearPlanMantenimientoFormState = {
  entity: PlanMantenimientoNueva;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CabeceraModalCrear,
    InformacionGeneralForm,
    ModalMantenedor,
    AsociarPautaFrecuenciaGrid,
    AsociarFlotaEtiquetaVehiculo,
    ConfigurarNotificacion,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperHeader,
    CrudStepperItems,
    MensajeValidacion,
  },
})
export default class CrearPlanMantenimientoModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;

  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.PlanDeMantenimiento;

  pasoActivoIndex = 1;
  readonly pasos = makePlanesPasosCrear();
  form: CrearPlanMantenimientoFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };

  vehiculos: AsociarFlotaEtiquetaVehiculoChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };

  dialogConfirmacionGuardar: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  clienteId = config.getClienteSesion();
  pautasActividadesMantenimiento: PautasPlanesMantenimiento[] = [];
  isPautaValid = true;
  isPautaValidKilHoras = true;

  distribucion: DistribucionPlanMantenimiento[] = [];
  calendario: CalendarioPlanMantenimiento[] = [];

  /*Validacion*/
  showValidacion: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';
  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  readonly colDefVehiculo: Array<ColDef> = [
    {
      headerName: 'Código',
      field: 'id',
      hide: true,
    },
    {
      headerName: 'Unidad',
      field: 'unidad',
      lockVisible: true,
      suppressMovable: true,
    },
    {
      headerName: 'Tipo de Vehículo',
      field: 'tipoVehiculo',
    },
    {
      headerName: 'Marca',
      field: 'marca',
    },
    {
      headerName: 'Modelo',
      field: 'modelo',
    },
    {
      headerName: 'Tipo de Combustible',
      field: 'tipoCombustible',
    },
    {
      headerName: 'Tipo de Transmisión',
      field: 'tipoTransmision',
    },
    {
      headerName: 'Año',
      field: 'ano',
    },
  ];

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleConfirmacionGuardar(isConfirmado: boolean) {
    this.dialogConfirmacionGuardar = false;
    if (!isConfirmado) {
      return;
    }
    this.loadingService.showLoading();

    const contactos: number[] = [];
    const listasDistribucion: number[] = [];
    const calendarios: number[] = [];
    const usuarios: number[] = [];

    this.calendario.forEach(x => {
      calendarios.push(x.id);
    });
    this.distribucion.forEach(x => {
      if (x.tipo === 'Contacto') {
        contactos.push(x.id);
      } else if (x.tipo === 'Lista de Distribución') {
        listasDistribucion.push(x.id);
      } else if (x.tipo === 'Usuario') {
        usuarios.push(x.id);
      }
    });
    const PlanMantenimiento: PlanMantenimientoAsociacion = {
      ...this.pasos.informacionGeneral.formState.entity,
      clienteId: this.clienteId,
      pautas: this.pautasActividadesMantenimiento,
      vehiculos: this.vehiculos.vehiculos,
      contactos: contactos,
      listasDistribucion: listasDistribucion,
      usuarios: usuarios,
      calendarios: calendarios,
      ...this.pasos.configurarNotificacion.formState.entity,
      notificaEmail: true,
      notificaGps: false,
      notificaBrowser: false,
    };

    return crearPlanMantenimiento(PlanMantenimiento)
      .then(() =>
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.crear', {
            entidad: 'Plan de Mantenimiento',
            creadoA: 'creado',
          })
        )
      )
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar crear el Plan de Mantenimiento.`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
        this.$emit('crear');
      });
  }

  constructor() {
    super();

    this.pasos.asociarPauta.permitirContinuar = this.permiteContinuarPautas;
  }

  handleGuardarClick() {
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'el Plan de Mantenimiento',
    });

    this.dialogConfirmacionGuardar = true;
  }

  permiteContinuarPautas() {
    if (!this.pautasActividadesMantenimiento.length) {
      this.tituloValidacion = 'Seleccionar Pauta';
      this.mensajeValidacion =
        'Debe seleccionar al menos una Pauta de Actividades.';
      this.showValidacion = true;
      return false;
    } else if (!this.isPautaValid) {
      this.tituloValidacion = 'Ingresar Frecuencia';
      this.mensajeValidacion =
        'Debe ingresar al menos una frecuencia en cada Pauta de Actividades seleccionadas.';
      this.showValidacion = true;
      return false;
    } else if (!this.isPautaValidKilHoras) {
      this.tituloValidacion = 'Validación de Frecuencias';
      this.mensajeValidacion =
        'Los valores para Kilometros deben ser mayor o igual a 500 kilometros, para Horas Motor mayor o igual a 50 horas y Tiempo mayor o igual a 1 día.';
      this.showValidacion = true;
      return false;
    }

    return true;
  }

  async handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  async handleFormChangeNotificacion(event: FormChangeEvent) {
    this.pasos.configurarNotificacion.formState = event;
  }

  handlePautasChange(
    actividadMantenimiento: PautasPlanesMantenimiento[],
    valid: boolean,
    validKiHolas: boolean
  ) {
    this.isPautaValidKilHoras = validKiHolas;
    this.isPautaValid = valid;
    this.pautasActividadesMantenimiento = actividadMantenimiento;
  }

  handleVehiculosChange(event: AsociarFlotaEtiquetaVehiculoChangeEvent) {
    this.vehiculos = event;
  }

  handleListaDistChange(distribucion: DistribucionPlanMantenimiento[]) {
    this.distribucion = distribucion;
  }

  handleCalendarioChange(calendario: CalendarioPlanMantenimiento[]) {
    this.calendario = calendario;
  }
}
</script>
