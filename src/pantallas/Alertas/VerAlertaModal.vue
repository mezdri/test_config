<template>
  <ModalMantenedor :show="show">
    <CabeceraModal titulo="Ver Detalle Alerta" @cerrar="handleCerrar" />
    <CrudStepsNavBar
      :pasos="pasos"
      v-model="pasoActivoIndex"
      :validar-paso="false"
    />
    <ContenidoModal>
      <ConfigurarAlertaForm
        :lstAlertasBase="lstAlertasBase"
        :alertaSeleccionada="alertaSeleccionada"
        :modoVer="true"
        v-show="pasoActivoIndex === pasos.configurarAlerta.step"
        @showAsociarVehiculos="handleShowAsociarVehiculos"
      />
      <v-flex>
        <AsociarFlotaEtiquetaVehiculo
          :flotas-id-seleccionar="
            alertaSeleccionada && alertaSeleccionada.flotasId
          "
          :etiquetas-id-seleccionar="
            alertaSeleccionada && alertaSeleccionada.etiquetasId
          "
          :vehiculos-id-seleccionar="
            alertaSeleccionada && alertaSeleccionada.vehiculosId
          "
          :col-def-vehiculo="vehiculoColDefs"
          v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
          :readonly="true"
        />
      </v-flex>
      <!-- <v-flex v-if="!showAsociarVehiculos">
        <AsociarFlotaEtiquetaVehiculoXMantenimiento
          v-show="pasoActivoIndex === pasos.asociarVehiculos.step"
          :vehiculosIdSeleccionar="alertaSeleccionada && alertaSeleccionada.vehiculosId"
        ></AsociarFlotaEtiquetaVehiculoXMantenimiento>
      </v-flex>-->
      <ConfigurarNotificacionForm
        :alertaSeleccionada="alertaSeleccionada"
        :modoVer="true"
        v-show="pasoActivoIndex === pasos.configurarNotificaciones.step"
      />
    </ContenidoModal>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';

import { Funcionalidades } from '@/config/funcionalidades';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import CrudStepsNavBar from '@/reusable/Mantenedor/CrudStepsNavBar.vue';
import ContenidoModal from '@/reusable/Modal/ContenidoModal.vue';
import { CodigoAccion } from '@/views/base/VariablesPermisos';

import ConfigurarAlertaForm from '@/pantallas/Alertas/ConfigurarAlertaForm.vue';
import AsociarFlotaEtiquetaVehiculo from '@/reusable/AsociarFlotaEtiquetaVehiculo/AsociarFlotaEtiquetaVehiculo.vue';
import ConfigurarNotificacionForm from '@/pantallas/Alertas/ConfigurarNotificacionForm.vue';

import { AlertaBackend } from '@/interfaces/Alertas';
import { AlertasBaseBackend } from '@/pantallas/ConfigurarBase/ConfiguracionBase';
import { PasosCrud } from '@/reusable/Mantenedor/mantenedorUtils';
import { ColDef } from 'ag-grid-community';
import AsociarFlotaEtiquetaVehiculoXMantenimiento from '@/pantallas/Informes/partes/AsociarFlotaEtiquetaVehiculoXMantenimiento.vue';

@Component({
  components: {
    ModalMantenedor,
    CabeceraModal,
    CrudStepsNavBar,
    ContenidoModal,
    ConfigurarAlertaForm,
    AsociarFlotaEtiquetaVehiculo,
    ConfigurarNotificacionForm,
    AsociarFlotaEtiquetaVehiculoXMantenimiento,
  },
})
export default class VerAlertaModal extends Vue {
  @Prop({ required: true }) show: boolean;
  @Prop({ required: true }) lstAlertasBase: AlertasBaseBackend[];
  @Prop({ required: true }) alertaSeleccionada: AlertaBackend;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Alertas;

  showAsociarVehiculos = true;

  pasoActivoIndex: number = 1;
  readonly pasos: PasosCrud = {
    configurarAlerta: {
      accion: 'Ver - Configurar Alerta',
      visible: true,
      step: 1,
      title: 'Configurar Alerta',
      icon: 'info',
    },
    asociarVehiculos: {
      accion: 'Ver - Asociar Flotas Etiquetas o Vehículos',
      visible: true,
      step: 2,
      title: 'Asociar Vehículos',
      icon: 'directions_car',
    },
    configurarNotificaciones: {
      accion: 'Ver - Configurar Notificaciones',
      visible: true,
      step: 3,
      title: 'Configurar Notificación',
      icon: 'person',
    },
  };

  vehiculoColDefs: ColDef[] = [
    {
      headerName: 'Código',
      field: 'id',
      hide: true,
    },
    {
      headerName: 'Unidad',
      field: 'unidad',
      lockVisible: true,
    },
    {
      headerName: 'Flota',
      field: 'flota.nombre',
    },
  ];

  constructor() {
    super();
  }

  handleCerrar() {
    this.pasoActivoIndex = 1;
    this.$emit('cerrar');
  }

  handleShowAsociarVehiculos(showAsociarVehiculos: boolean) {
    this.showAsociarVehiculos = showAsociarVehiculos;
  }
}
</script>
