<template>
  <div>
    <v-tabs left v-model="tabModel" :key="tabKey">
      <v-tab id="miTab0" :href="`#tab-1`">Registro Actividades</v-tab>
      <v-tab id="miTab1" :href="`#tab-2`" v-show="mostrarAlertas"
        >Alertas</v-tab
      >
      <v-tab id="miTab2" :href="`#tab-3`" v-show="accionComunicaciones.visible"
        >Comunicaciones</v-tab
      >
      <v-tab id="miTab3" :href="`#tab-4`" v-show="mostrarMantenimiento"
        >Mantenimiento Preventivo</v-tab
      >
      <v-tab id="miTab4" :href="`#tab-5`" v-show="mostrarMantenimiento"
        >Mantenimiento Correctivo</v-tab
      >
    </v-tabs>
    <v-flex md12 sm12 xs12 v-show="tabModel === 'tab-1'">
      <v-card class="rounded-card">
        <ActividadesDetalleGrid />
      </v-card>
    </v-flex>
    <v-flex md12 sm12 xs12 v-show="tabModel === 'tab-2'">
      <v-card class="rounded-card">
        <AlertasDetalleGrid />
      </v-card>
    </v-flex>
    <v-flex md12 sm12 xs12 v-show="tabModel === 'tab-3'">
      <v-card class="rounded-card">
        <ComunicacionesGrid />
      </v-card>
    </v-flex>
    <v-flex md12 sm12 xs12 v-show="tabModel === 'tab-4'">
      <v-card class="rounded-card">
        <PreventivasDetalleGrid />
      </v-card>
    </v-flex>
    <v-flex md12 sm12 xs12 v-show="tabModel === 'tab-5'">
      <v-card class="rounded-card">
        <CorrectivasDetalleGrid :tabModel="tabModel" />
      </v-card>
    </v-flex>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ActividadesDetalleGrid from '@/pantallas/Inicio/DetalleVehiculo/ActividadesDetalleGrid.vue';
import AlertasDetalleGrid from '@/pantallas/Inicio/DetalleVehiculo/AlertasDetalleGrid.vue';
import ComunicacionesGrid from '@/pantallas/Inicio/DetalleVehiculo/ComunicacionesGrid.vue';
import vehiculoEventBus from '../VehiculosGrid/vehiculoEventBus';
import { Vehiculo } from '../VehiculosData/fetchVehiculos';
import { Actividad } from '../ActividadesData/fetchActividades';
import store from '../../../store';
import {
  PermisoAccion,
  CodigoAccion,
} from '../../../views/base/VariablesPermisos';
import { ComponenteBase } from '../../../views/base/ComponenteBase';
import { Funcionalidades } from '../../../config/funcionalidades';
import PreventivasDetalleGrid from '@/pantallas/Inicio/DetalleVehiculo/PreventivasDetalleGrid.vue';
import CorrectivasDetalleGrid from '@/pantallas/Inicio/DetalleVehiculo/CorrectivasDetalleGrid.vue';

@Component({
  components: {
    ActividadesDetalleGrid,
    AlertasDetalleGrid,
    ComunicacionesGrid,
    PreventivasDetalleGrid,
    CorrectivasDetalleGrid,
  },
})
export default class DetalleTabs extends ComponenteBase {
  @Prop({ default: false }) verDetalleActivo: boolean;
  funcionalidad: Funcionalidades = Funcionalidades.Inicio;
  mostrarAlertas = false;
  mostrarMantenimiento = false;
  mostrarCorrectivas = false;
  mostrarPreventivas = false;
  tabModel: string = 'tab-1';
  tabKey: number = 1;

  accionComunicaciones: PermisoAccion = {
    accionCodigo: CodigoAccion.Comunicaciones,
    visible: false,
  };
  accionesTotales: PermisoAccion[] = [this.accionComunicaciones];
  mounted() {
    vehiculoEventBus.onAbrirDetalleVehiculo(this.handleAbrirDetalle);
    this.permisosAlertasEIgnicion();
    this.permisosHistoricos();
    this.tabModel = 'tab-1';
  }

  @Watch('verDetalleActivo', { deep: true, immediate: true })
  handleTabModel() {
    this.tabKey++;
  }

  permisosAlertasEIgnicion() {
    if (store.state.permisoAlerta) {
      this.mostrarAlertas = true;
    } else {
      this.mostrarAlertas = false;
    }
  }

  permisosHistoricos() {
    if (store.state.permisoHistorico) {
      this.mostrarMantenimiento = true;
    } else {
      this.mostrarMantenimiento = false;
    }
  }

  handleAbrirDetalle(
    vehiculo: Vehiculo,
    actividad: Actividad,
    ultimaActividad: Actividad,
    show: boolean,
    indice: string
  ) {
    switch (indice) {
      case '0':
        this.tabModel = 'tab-6'; //Llamada para solucionar bug visual de componente v-tab de vuetify.
        setTimeout(() => {
          this.tabModel = 'tab-1';
        }, 100);
        break;
      case '1':
        this.tabModel = 'tab-2';
        break;
      case '2':
        this.tabModel = 'tab-3';
        break;
      default:
        this.tabModel = 'tab-1';
        break;
    }
  }
}
</script>
