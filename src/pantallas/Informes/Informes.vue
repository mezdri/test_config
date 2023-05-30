<template>
  <v-container fluid grid-list-md>
    <v-tabs left color="transparent">
      <v-tab>Generar Informe</v-tab>
    </v-tabs>
    <v-divider />
    <div class="box-informes">
      <h2 class="h2_title">Seleccione el tipo de informe a generar:</h2>

      <ul>
        <li
          v-for="(item, k) in informesLista"
          :key="k"
          @click="abrirModal(item.name)"
        >
          Informe {{ item.fullName }}
        </li>
      </ul>
    </div>

    <!-- Lista de modales por tipo de informes -->
    <ModalInformeActividades
      :show="mostrarModal === 'actividades'"
      :titulo="'Generar Informe de Actividades'"
      @cerrar="cierreModal"
    />
    <ModalInformeKilometraje
      :show="mostrarModal === 'kilometraje'"
      :titulo="'Generar Informe de Kilometraje'"
      @cerrar="cierreModal"
    />
    <ModalInformeDetalleViaje
      :show="mostrarModal === 'detalle'"
      :titulo="'Generar Informe de Detalle de Viaje'"
      @cerrar="cierreModal"
    />
    <ModalInformeSitio
      :show="mostrarModal === 'sitio'"
      :titulo="'Generar Informe de Sitio'"
      @cerrar="cierreModal"
    />
    <ModalInformeResumenTiempos
      :show="mostrarModal === 'resumen'"
      :titulo="'Generar Informe de Resumen de Tiempos'"
      @cerrar="cierreModal"
    />
    <ModalInformeMantenimientos
      :show="mostrarModal === 'mantenimientos'"
      :titulo="'Generar Informe de Mantenimientos Vencidos'"
      @cerrar="cierreModal"
    />
    <ModalInformeExceso
      :show="mostrarModal === 'exceso'"
      :titulo="'Generar Informe de Exceso de Velocidad'"
      @cerrar="cierreModal"
    />
    <ModalInformeTemperatura
      :show="mostrarModal === 'temperatura'"
      :titulo="'Generar Informe de Temperatura'"
      @cerrar="cierreModal"
    />
	<ModalInformeAlertas
      :show="mostrarModal === 'alertas'"
      :titulo="'Generar Informe de Alertas'"
      @cerrar="cierreModal"
    />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ModalInformeActividades from '@/pantallas/Informes/ModalInformeActividades.vue';
import ModalInformeKilometraje from '@/pantallas/Informes/ModalInformeKilometraje.vue';
import ModalInformeDetalleViaje from '@/pantallas/Informes/ModalInformeDetalleViaje.vue';
import ModalInformeSitio from '@/pantallas/Informes/ModalInformeSitio.vue';
import ModalInformeResumenTiempos from '@/pantallas/Informes/ModalInformeResumenTiempos.vue';
import ModalInformeMantenimientos from '@/pantallas/Informes/ModalInformeMantenimientos.vue';
import ModalInformeExceso from '@/pantallas/Informes/ModalInformeExceso.vue';
import ModalInformeTemperatura from '@/pantallas/Informes/ModalInformeTemperatura.vue';
import ModalInformeAlertas from '@/pantallas/Informes/ModalInformeAlertas.vue';


@Component({
  components: {
    ModalInformeActividades,
    ModalInformeKilometraje,
    ModalInformeDetalleViaje,
    ModalInformeSitio,
    ModalInformeResumenTiempos,
    ModalInformeMantenimientos,
    ModalInformeExceso,
    ModalInformeTemperatura,
	ModalInformeAlertas
  },
})
export default class Informes extends Vue {
  mostrarModal: string | boolean = false;
  informesLista: any = [
    {
      name: 'actividades',
      fullName: 'Actividades',
    },
    {
      name: 'kilometraje',
      fullName: 'Kilometraje',
    },
    {
      name: 'detalle',
      fullName: 'Detalle de Viaje',
    },
    {
      name: 'sitio',
      fullName: 'Sitio',
    },
    {
      name: 'resumen',
      fullName: 'Resumen de Tiempos',
    },
    {
      name: 'mantenimientos',
      fullName: 'Mantenimientos Vencidos',
    },
    {
      name: 'exceso',
      fullName: 'Exceso de Velocidad',
    },
    {
      name: 'temperatura',
      fullName: 'Temperatura',
    },
	{
      name: 'alertas',
      fullName: 'Alertas',
    }
	
  ];

  abrirModal(nombre: string | boolean = false) {
    this.mostrarModal = nombre;
  }

  cierreModal() {
    this.mostrarModal = false;
  }
  
 
}
</script>

<style scoped>
.box-informes {
  margin: 20px 0;
}
.h2_title {
  margin-bottom: 10px;
  font-weight: normal;
  font-size: 16px;
}
</style>

<style>
.modal {
  padding: 30px 0;
}

.mt-20 {
  margin-top: 20px;
}

ul li {
  margin-bottom: 10px;
  cursor: pointer;
}
</style>
