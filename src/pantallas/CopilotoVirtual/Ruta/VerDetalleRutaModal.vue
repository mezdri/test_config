<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Ver Detalle de la Ruta" @cerrar="handleCerrar" />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <CrearRutaForm
        :isVerDetalle="true"
        :modoEditar="false"
        :rutasDetalles="rutasDetalles"
        :rutaSeleccionada="rutaSeleccionada"
        :readonly="true"
        v-show="pasoActivoIndex === pasos.informacionGeneral.step"
        @changeDatosZonas="handleDatosZonas"
      />

      <AsociarEventosFormDetalle
        :idRuta="idRuta"
        :lstRutas="lstRutas"
        :lstselectedTipoEvento="lstselectedTipoEvento"
        :lsSelectedMsj="lsSelectedMsj"
        :rutaSeleccionada="rutaSeleccionada"
        @changeDatosEventos="handleDatosEventos"
        :isVerDetalle="true"
        v-show="pasoActivoIndex === pasos.asociarEventos.step"
      />

      <AsociarMensajesFormDetalle
        :idRuta="idRuta"
        :demoM="demo"
        :lstselectedTipoEvento="lstselectedTipoEventoMsj"
        :mensajes="mensajes"
        :lsSelectedMsj="this.msjSeleccionado"
        :isVerDetalle="true"
        :lstEventoMensajes="lstEventoMensajes"
        :rutaSeleccionada="rutaSeleccionada"
        v-show="pasoActivoIndex === pasos.asociarMensajes.step"
      />

      <AsociarFlotaEtiquetaVehiculoIndividual
        :col-def-vehiculo="vehiculoColDefs"
        :vehiculosIdSeleccionar="vehiculosIdSeleccionar"
        :flotasIdSeleccionar="flotasIdSeleccionar"
        :etiquetasIdSeleccionar="etiquetasIdSeleccionar"
        :readonly="true"
        @change="handleAsociacionesChange"
        v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
      />
    </ContenidoModal>
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
import CrearRutaForm from '@/pantallas/CopilotoVirtual/Ruta/CrearRutaForm.vue';
import AsociarEventosFormDetalle from '@/pantallas/CopilotoVirtual/Ruta/AsociarEventosFormDetalle.vue';
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
} from './rutas';
import { AxiosVue } from '@/AxiosVue';
import { Mensaje } from '../Mensaje/mensaje';
import AsociarFlotaEtiquetaVehiculoIndividual, {
  AsociarFlotaEtiquetaVehiculoIndividualChangeEvent,
} from '@/reusable/AsociarFlotaEtiquetaVehiculoIndividual/AsociarFlotaEtiquetaVehiculoIndividual.vue';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    CrudStepsNavBar,
    ContenidoModal,
    CabeceraModalCrear,
    CrearRutaForm,
    AsociarEventosFormDetalle,
    // AsociarMensajesForm,
    AsociarMensajesFormDetalle,
    NavegacionModalCrud,
    CrudStepperContent,
    CrudStepperItems,
    CrudStepperHeader,
    AsociarFlotaEtiquetaVehiculoIndividual,
  },
})
export default class VerDetalleRutaModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) rutaSeleccionada: Ruta;

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
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
      title: 'Información General',
      icon: 'info',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
    asociarEventos: {
      accion: 'Crear - Asociar Eventos',
      visible: true,
      step: 2,
      title: 'Seleccionar Eventos',
      icon: 'ballot',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
    asociarMensajes: {
      accion: 'Crear - Asociar Mensajes',
      visible: true,
      step: 3,
      title: 'Seleccionar Mensajes',
      icon: 'add_comment',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
    asociarVehiculos: {
      accion: 'Crear - Asociar Flotas Etiquetas o Vehículos',
      visible: true,
      step: 4,
      title: 'Asociar Vehículos',
      icon: 'directions_car',
      formState: {
        entity: null,
        validator: null,
        isDirty: false,
      },
    },
  };

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

  created() {
    this.loadingService.showLoading();
    this.axiosCopiloto.http
      .get('MensajeCopiloto/getMensajes')
      .then(res => {
        let data: Mensaje[] = res.data;

        this.demo = data.reduce(function(r: any, e: any) {
          r[e.id] = e.titulo;
          return r;
        }, {});
      })
      .finally(() => this.loadingService.hideLoading);
    this.handleRutasSeleccionadas();
  }

  @Watch('rutaSeleccionada')
  handleRutasSeleccionadas() {
    if (!this.rutaSeleccionada) {
      return;
    }
    //this.datosGrillaFormCrear();

    this.getVehiculos(this.rutaSeleccionada.id);
  }

  handleCerrar() {
    this.$emit('cerrar');
  }

  handleDatosZonas(lstBaseRuta: BaseRuta[]) {
    this.rutasDetalles = lstBaseRuta;
    this.lstRutas = lstBaseRuta;
   
    this.lstRutas.forEach(r => {
      r.lstTipoEventoCopiloto = [
        {
          id: 1,
          idZona: r.zona,
          nombre: 'Entrada',
          selected: false,
        },
        {
          id: 2,
          idZona: r.zona,
          nombre: 'Exceso de velocidad',
          selected: false,
        },
        {
          id: 3,
          idZona: r.zona,
          nombre: 'Velocidad bajo la mínima',
          selected: false,
        },
        {
          id: 4,
          idZona: r.zona,
          nombre: 'Detención',
          selected: false,
        },
        {
          id: 5,
          idZona: r.zona,
          nombre: 'Permanencia',
          selected: false,
        },
        {
          id: 6,
          idZona: r.zona,
          nombre: 'Restricción horaria',
          selected: false,
        },
        {
          id: 7,
          idZona: r.zona,
          nombre: 'Salida',
          selected: false,
        },
        {
          id: 8,
          idZona: r.zona,
          nombre: 'Próximo a entrar a la zona',
          selected: false,
        },
      ];
    });
  }

  handleDatosEventos(lstEventosMensajes: any[]) {
    if (this.lstEventoMensajes.length === 0 && lstEventosMensajes.length > 0) {
      this.lstEventoMensajes = lstEventosMensajes;
    }
  }

  async getVehiculos(rutaId: number) {
    let vehiculos = await this.axiosCopiloto.http.get(
      `RutaCopiloto/getVehiculos/${rutaId}`
    );
    this.vehiculosIdSeleccionar = vehiculos.data[0];
    this.flotasIdSeleccionar = vehiculos.data[1];
    this.etiquetasIdSeleccionar = vehiculos.data[2];
  }

  handleAsociacionesChange(
    event: AsociarFlotaEtiquetaVehiculoIndividualChangeEvent
  ) {
    this.asociacionesVehiculos = event;
  }
}
</script>
