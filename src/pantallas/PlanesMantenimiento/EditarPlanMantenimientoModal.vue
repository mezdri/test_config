<template>
  <ModalMantenedor :show="show">
    <CabeceraModalEditar
      titulo="Editar Plan de Mantenimiento"
      @cerrar="handleCerrar"
      :form="
        Object.values(pasos).find(x => x.step === pasoActivoIndex).formState
      "
      @guardar="handleGuardar"
      :pasos="pasos"
      :pasoActivoIndex="pasoActivoIndex"
      entidad="Plan de Mantenimiento"
      :nombreEntidad="
        planMantenimientoSeleccionado
          ? planMantenimientoSeleccionado.nombre
          : ''
      "
    ></CabeceraModalEditar>

    <CrudStepsNavBar :pasos="pasos" v-model="pasoActivoIndex" />

    <ContenidoModal>
      <InformacionGeneralForm
        @change="handleFormChange"
        :planMantenimientoSeleccionado="planMantenimientoSeleccionado"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />

      <AsociarPautaFrecuenciaGrid
        @change="handlePautasChange"
        :pautasSeleccionadas="
          planMantenimientoSeleccionado
            ? planMantenimientoSeleccionado.pautas
            : planMantenimientoSeleccionado
        "
        v-show="pasoActivoIndex === pasos.asociarPauta.step"
        :planMantenimientoSeleccionado="planMantenimientoSeleccionado"
      />

      <AsociarFlotaEtiquetaVehiculo
        @change="handleVehiculosChange"
        :vehiculosIdSeleccionar="
          vehiculosSeleccionados ? vehiculosSeleccionados : []
        "
        :colDefVehiculo="colDefVehiculo"
        v-show="pasoActivoIndex === pasos.asociarFlotas.step"
        :esEditar="!planMantenimientoSeleccionado ? false : true"
      />

      <ConfigurarNotificacion
        @change="handleFormChangeNotificacion"
        @distribucionChange="handleListaDistChange"
        @calendarioChange="handleCalendarioChange"
        :planMantenimientoSeleccionado="planMantenimientoSeleccionado"
        :distribucionSeleccionada="distribucion"
        :calendarioSeleccionado="notificacion ? notificacion.calendarios : []"
        v-show="pasoActivoIndex === pasos.configurarNotificacion.step"
        :accion="2"
      />
    </ContenidoModal>

    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="$t(tituloValidacion)"
      :mensaje="$t(mensajeValidacion)"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import InformacionGeneralForm from '@/pantallas/PlanesMantenimiento/InformacionGeneralForm.vue';
import CabeceraModalEditar from '@/reusable/Modal/CabeceraModalEditar.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import {
  PlanMantenimiento,
  PlanMantenimientoNueva,
  PlanMantenimientoAsociacion,
  PautasPlanesMantenimiento,
  PlanMantenimientoDetalle,
  makePlanesPasosEditar,
  DistribucionPlanMantenimiento,
  CalendarioPlanMantenimiento,
  NotificacionPlanMantenimiento,
  ContactosPlanMantenimiento,
  ListaDistribucionPlanMantenimiento,
  NotificacionPlanMantenimientoDetalle,
} from './Data/PlanMantenimiento';
import { crearPlanMantenimiento } from '@/pantallas/PlanesMantenimiento/Data/crearPlanMantenimiento';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { Validator } from 'vee-validate/types/vee-validate';
import Confirmation from '@/components/Confirmation.vue';
import AsociarPautaFrecuenciaGrid from '@/pantallas/PlanesMantenimiento/AsociarPautaFrecuenciaGrid.vue';
import config from '../../config';
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import AsociarFlotaEtiquetaVehiculo from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotaEtiquetaVehiculo.vue';
import { editarPlanMantenimiento } from './Data/editarPlanMantenimiento';
import { AsociarFlotaEtiquetaVehiculoChangeEvent } from '../Recepcion/AsociarFlotaEtiquetaVehiculo.vue';
import ConfigurarNotificacion from './ConfigurarNotificacion.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import { checkboxColumnDef } from '../../reusable/Grid/aggridColumnDefUtils';
import { ColDef } from 'ag-grid-community';
import { fetchNotificacionesDetalle } from './Data/fetchNotificaciones';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import { Usuario } from '@/reusable/ListDistrContactosUsuarios/fetchListDistrContactosUsuarios';

type EditarPlanMantenimientoFormState = {
  entity: PlanMantenimientoNueva;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CabeceraModalEditar,
    InformacionGeneralForm,
    ModalMantenedor,
    AsociarPautaFrecuenciaGrid,
    GuardarCambiosButton,
    AsociarFlotaEtiquetaVehiculo,
    CrudStepsNavBar,
    ContenidoModal,
    NavegacionModalCrud,
    ConfigurarNotificacion,
    MensajeValidacion,
  },
})
export default class EditarPlanMantenimientoModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop() planMantenimientoSeleccionado: PlanMantenimientoDetalle;
  @Prop() notificacion: NotificacionPlanMantenimientoDetalle;

  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.PlanDeMantenimiento;

  pasoActivoIndex = 1;
  readonly pasos = makePlanesPasosEditar();

  form: EditarPlanMantenimientoFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };
  vehiculos: AsociarFlotaEtiquetaVehiculoChangeEvent = {
    flotas: [],
    etiquetas: [],
    vehiculos: [],
  };
  clienteId = config.getClienteSesion();
  pautasActividadesMantenimiento: PautasPlanesMantenimiento[] = [];
  isPautaValid: boolean = true;
  distribucion: DistribucionPlanMantenimiento[] = [];
  calendario: CalendarioPlanMantenimiento[] = [];
  vehiculosSeleccionados: number[] = [];
  isPautaValidKilHoras = true;
  /*Validacion*/
  showValidacion: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

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
  rowSelection: 'single';

  /* event handlers */

  constructor() {
    super();

    this.pasos.asociarPauta.permitirContinuar = this.permiteContinuarPautas;
  }

  mounted() {
    this.handleVehiculosSeleccionados();
    this.handleNotificacionSeleccionada();
  }

  @Watch('planMantenimientoSeleccionado')
  handleVehiculosSeleccionados() {
    if (!this.planMantenimientoSeleccionado) {
      return;
    }

    this.makeVehiculosSeleccionados();
  }

  @Watch('notificacion')
  handleNotificacionSeleccionada() {
    if (!this.notificacion) {
      return;
    }

    this.makeDistribucionSeleccionada(this.notificacion);
  }

  makeVehiculosSeleccionados() {
    this.planMantenimientoSeleccionado.vehiculos.forEach(x => {
      this.vehiculosSeleccionados.push(x.id);
    });
  }

  makeDistribucionSeleccionada(
    notificacion: NotificacionPlanMantenimientoDetalle
  ) {
    const makeDistribucionConGridId = (prependTexto: string) => (
      x:
        | ContactosPlanMantenimiento
        | ListaDistribucionPlanMantenimiento
        | Usuario
    ): DistribucionPlanMantenimiento => ({
      ...x,
      agGridId: `${prependTexto}-${x.id}}`,
    });
    this.distribucion = [
      ...this.notificacion.listaDistribuciones.map(
        makeDistribucionConGridId('Lista')
      ),
      ...this.notificacion.contactos.map(makeDistribucionConGridId('Contacto')),
      ...this.notificacion.usuarios.map(makeDistribucionConGridId('Usuario')),
    ];
  }

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleGuardar(isConfirmado: boolean) {
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

    this.loadingService.showLoading();
    const PlanMantenimiento: PlanMantenimientoAsociacion = {
      ...this.pasos.informacionGeneral.formState.entity,
      idNotificacion: this.notificacion.id,
      id: this.planMantenimientoSeleccionado.id,
      clienteId: this.clienteId,
      pautas: this.pautasActividadesMantenimiento,
      vehiculos: this.vehiculos.vehiculos,
      contactos: contactos,
      listasDistribucion: listasDistribucion,
      calendarios: calendarios,
      usuarios: usuarios,
      ...this.pasos.configurarNotificacion.formState.entity,
      notificaEmail: true,
      notificaGps: false,
      notificaBrowser: false,
    };

    return editarPlanMantenimiento(PlanMantenimiento)
      .then(() =>
        this.$snotify.success(
          this.$t('mensajes.mensajesExito.editar', {
            entidad: 'Plan de Mantenimiento',
            creadoA: 'editado',
          })
        )
      )
      .catch(() =>
        this.$snotify.error(
          `Ha ocurrido un error al intentar editar el Plan de Mantenimiento.`,
          { timeout: 3000 }
        )
      )
      .finally(() => {
        this.loadingService.hideLoading();
        this.$emit('editar');
      });
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

  handleFormChange(event: FormChangeEvent) {
    this.pasos.informacionGeneral.formState = event;
  }

  handleFormChangeNotificacion(event: FormChangeEvent) {
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
