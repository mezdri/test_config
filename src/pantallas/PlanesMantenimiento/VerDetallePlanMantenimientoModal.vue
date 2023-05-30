<template>
  <ModalMantenedor :show="show">
    <CabeceraModal
      titulo="Ver Detalle Plan de Mantenimiento"
      @cerrar="handleCerrar"
    ></CabeceraModal>
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <InformacionGeneralForm
        :disabled="true"
        :planMantenimientoSeleccionado="planMantenimientoSeleccionado"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
      />
      <AsociarPautaFrecuenciaGrid
        :disabled="true"
        :pautasSeleccionadas="
          planMantenimientoSeleccionado
            ? planMantenimientoSeleccionado.pautas
            : planMantenimientoSeleccionado
        "
        v-show="pasoActivoIndex === pasos.asociarPauta.step"
      />
      <AsociarFlotaEtiquetaVehiculo
        :readonly="true"
        :vehiculosIdSeleccionar="
          vehiculosSeleccionados ? vehiculosSeleccionados : []
        "
        :colDefVehiculo="colDefVehiculo"
        v-show="pasoActivoIndex === pasos.asociarFlotas.step"
      />
      <ConfigurarNotificacion
        :disabled="true"
        :planMantenimientoSeleccionado="planMantenimientoSeleccionado"
        :distribucionSeleccionada="distribucion"
        :calendarioSeleccionado="notificacion ? notificacion.calendarios : []"
        v-show="pasoActivoIndex === pasos.configurarNotificacion.step"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import InformacionGeneralForm from '@/pantallas/PlanesMantenimiento/InformacionGeneralForm.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import VolverButton from '@/reusable/Modal/VolverButton.vue';
import ContinuarButton from '@/reusable/Modal/ContinuarButton.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { FormChangeEvent, FormState } from '@/reusable/Form/formUtils';
import {
  PlanMantenimiento,
  PlanMantenimientoNueva,
  PlanMantenimientoAsociacion,
  PautasPlanesMantenimiento,
  PlanMantenimientoDetalle,
  makePlanesPasosVerDetalle,
  DistribucionPlanMantenimiento,
  CalendarioPlanMantenimiento,
  NotificacionPlanMantenimientoDetalle,
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
import GuardarCambiosButton from '@/reusable/Modal/GuardarCambiosButton.vue';
import AsociarFlotaEtiquetaVehiculo from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotaEtiquetaVehiculo.vue';
import { editarPlanMantenimiento } from './Data/editarPlanMantenimiento';
import ConfigurarNotificacion from './ConfigurarNotificacion.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import { checkboxColumnDef } from '../../reusable/Grid/aggridColumnDefUtils';
import { ColDef } from 'ag-grid-community';
import { fetchNotificacionesDetalle } from './Data/fetchNotificaciones';
import { OperacionCrud } from '@/reusable/Mantenedor/OperacionCrud';
import { Funcionalidades } from '@/config/funcionalidades';
import { Usuario } from '@/reusable/ListDistrContactosUsuarios/fetchListDistrContactosUsuarios';

type EditarPlanMantenimientoFormState = {
  entity: PlanMantenimientoNueva;
  validator: Validator;
  isDirty: boolean;
};

@Component({
  components: {
    Confirmation,
    CabeceraModal,
    InformacionGeneralForm,
    ModalMantenedor,
    AsociarPautaFrecuenciaGrid,
    AsociarFlotaEtiquetaVehiculo,
    CrudStepsNavBar,
    ContenidoModal,
    NavegacionModalCrud,
    ConfigurarNotificacion,
  },
})
export default class VerDetallePlanMantenimientoModal extends OperacionCrud {
  @Prop({ default: true }) show: boolean;
  @Prop() planMantenimientoSeleccionado: PlanMantenimientoDetalle;
  @Prop() notificacion: NotificacionPlanMantenimientoDetalle;

  /* OperacionCrud */
  readonly funcionalidad: Funcionalidades = Funcionalidades.PlanDeMantenimiento;

  pasoActivoIndex = 1;
  readonly pasos = makePlanesPasosVerDetalle();
  form: EditarPlanMantenimientoFormState = {
    entity: null,
    validator: null,
    isDirty: null,
  };

  pautasActividadesMantenimiento: PautasPlanesMantenimiento[] = [];
  distribucion: DistribucionPlanMantenimiento[] = [];
  calendario: CalendarioPlanMantenimiento[] = [];
  vehiculosSeleccionados: number[] = [];

  readonly colDefVehiculo: Array<ColDef> = [
    checkboxColumnDef,
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

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  handleCerrar() {
    this.$emit('cerrar');
  }

  fetchNotificaciones(idPlan: number) {
    this.loadingService.showLoading();
    return fetchNotificacionesDetalle(idPlan)
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las Notificaciones. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
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
}
</script>
