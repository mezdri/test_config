<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Ver Detalle de la SIM" @cerrar="handleCerrar">
      <div
        class="numero_sim"
        style="

letter-spacing: 0.02em;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
margin-top: 16px;
;"
      >
        <h1>{{ serieNumeroSeleccionado }}</h1>
      </div>
    </CabeceraModal>

    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <!-- <ContenidoModal>
      
    </ContenidoModal> -->
    <!-- :serieNumeroSeleccionado="serieNumeroSeleccionado"
    :tipoEquipoSeleccionado="tipoEquipoSeleccionado"
    :serieactivanroSeleccionado="serieactivanroSeleccionado" -->
    <InventarioSimForm
      :modoVer="true"
      :isEditar="true"
      :serieNumeroSeleccionado="serieNumeroSeleccionado"
      :simestadolistSeleccionado="simestadolistSeleccionado"
    />
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';

// import AsociarMensajesForm from '@/pantallas/CopilotoVirtual/Ruta/AsociarMensajesForm.vue';
import AsociarMensajesFormDetalle from '@/pantallas/CopilotoVirtual/Ruta/AsociarMensajesFormDetalle.vue';
import CabeceraModalCrear from '@/reusable/Modal/CabeceraModalCrear.vue';
import { ServicioProxy } from '@/config/enums';
import NavegacionModalCrud from '@/reusable/Mantenedor/NavegacionModalCrud.vue';
import CrudStepperHeader from '@/reusable/Mantenedor/CrudStepperHeader.vue';
import CrudStepperItems from '@/reusable/Mantenedor/CrudStepperItems.vue';
import CrudStepperContent from '@/reusable/Mantenedor/CrudStepperContent.vue';
import { ColDef } from 'ag-grid-community';
import {
  BaseRuta,
  MensajeSeleccionado,
  Ruta,
  TipoEventoCopiloto,
  TipoEventoCopilotoSeleccionado,
} from '@/pantallas/CopilotoVirtual/Ruta/rutas';
import { AxiosVue } from '@/AxiosVue';
import { Mensaje } from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';
import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';
import { fetchReportesSerie } from './fetchReporteSerie';
import InventarioSimForm from './InventarioSimForm.vue';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    CabeceraModalCrear,
    InventarioSimForm,

    // AsociarMensajesForm,
    AsociarMensajesFormDetalle,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class VerEditarModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: null }) reporte_Seleccionado: any;
  @Prop({ default: null }) serieNumeroSeleccionado: any;
  @Prop({ default: null }) tipoEquipoSeleccionado: any;
  @Prop({ default: null }) simestadolistSeleccionado: any;

  rutasDetalles: BaseRuta[] = [];
  lstselectedTipoEvento: TipoEventoCopiloto[] = [];
  lstselectedTipoEventoMsj: TipoEventoCopilotoSeleccionado[] = [];
  mensajes: Mensaje[] = [];

  msjSeleccionado: MensajeSeleccionado[] = [];

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  vehiculosIdSeleccionar: number[] = [];
  etiquetasIdSeleccionar: number[] = [];
  flotasIdSeleccionar: number[] = [];

  axiosCopiloto: AxiosVue = new AxiosVue(ServicioProxy.Copiloto);

  lstRutas: BaseRuta[] = [];
  idRuta: number = null;
  lsSelectedMsj: MensajeSeleccionado[] = [];
  demo: any = {};

  lstEventoMensajes: any[] = [];

  pasoActivoIndex = 1;
  readonly pasos: PasosCrud = {
    requerimiento: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
      title: 'Detalle y Edición de SIM Número ' + this.serieNumeroSeleccionado,
      icon: 'ballot',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

  /* RequerimientoGeneral: any[]=[]
  fecha_de_alta: any[]=[]
  adp: any[]=[]
  rut_cliente: any[]=[]
  cliente: any[]=[]
  flota: any[]=[]

  async getOrders_by_id(reporte_Seleccionado: any) {
    let self = this;
    this.loadingService.showLoading();
    console.log('getReporte con id ' + reporte_Seleccionado);
    return fetchReportesSerie(
      { "reporte_Seleccionado": reporte_Seleccionado },
      'ReportesSerie/informacion'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.fecha_de_alta = data.data.data[0].asigfecha_alta
          self.RequerimientoGeneral = data.data.data[0].asigrequerimiento
          self.adp = data.data.data[0].asigcrm_adp
          self.rut_cliente = data.data.data[0].asigcrm_rutcli
          self.cliente = data.data.data[0].asigcrm_cliente
          self.flota = data.data.data[0].asigcrm_flota
          console.log("Aqui carga = ",self.fecha_de_alta, self.RequerimientoGeneral, self.adp, self.rut_cliente, self.flota);
         
          return data.data.data;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  } */
  @Watch('ReporteSeleccionado')
  handleRutasSeleccionadas() {
    return;
  }

  handleCerrar() {
    this.$emit('cerrar');
  }
}
</script>
<style></style>
