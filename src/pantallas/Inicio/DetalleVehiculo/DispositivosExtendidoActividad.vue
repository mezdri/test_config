<template>
  <div>
    <v-form>
      <v-container>
        <v-layout row wrap v-if="!actividadExtendida">
          <v-flex md12 row>
            <p class="centrado">Sin actividades extendidas</p>
          </v-flex>
        </v-layout>
        <v-layout
          row
          wrap
          v-else-if="actividadExtendida.dispositivos.length > 0"
        >
          <v-flex md12 row>
            <p>{{ actividadExtendida.nombre }}</p>
          </v-flex>

          <v-flex
            v-for="dispositivo in actividadExtendida.dispositivos"
            :key="dispositivo.descripcion"
            md3
            xs6
          >
            <span>{{ dispositivo.descripcion }}:</span>
            {{ dispositivo.valor }}
          </v-flex>
        </v-layout>
        <v-layout row wrap v-else>
          <v-flex md12 row>
            <p class="centrado">
              Detalle de actividad extendida no disponible
            </p>
          </v-flex>
        </v-layout>
      </v-container>
    </v-form>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { ActividadExtendida } from '@/pantallas/Inicio/ActividadesData/fetchActividades';

@Component({})
export default class DispositivosExtendidoActividad extends Vue {
  @Prop({ required: true }) id: string;
  @Prop({ required: true }) actividadExtendida: ActividadExtendida;
}
</script>
<style scoped>
p {
  font-weight: bold;
  font-size: 12px;
}
span {
  font-weight: 550;
  font-size: 11px;
}
.v-form > .container > .layout > .flex {
  padding: 2px;
  font-size: 11px;
}
p.centrado {
  font-size: 12px;
  font-weight: normal;
  text-align: center;
}
</style>
