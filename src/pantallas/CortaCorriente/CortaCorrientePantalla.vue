<template>
  <v-container fluid grid-list-md style="height: 100% !important;" id="ada">
    <v-dialog v-model="showInfo" transition="dialog-bottom-transition">
      <v-card style="width: 300px">
        <v-toolbar dark color="primary">
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important">
            Modelos Gps Habilitados
          </v-toolbar-title>
        </v-toolbar>
        <v-divider></v-divider>
        <table>
          <thead>
            <tr>
              <th>Marca</th>
              <th>Modelo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="model in modelsList" :key="model.nom_modelo">
              <td>{{ model.nom_marca }}</td>
              <td>{{ model.nom_modelo }}</td>
            </tr>
          </tbody>
        </table>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            data-testid="v-btn--cancelar"
            color="white"
            depressed
            small
            @click="showInfo = false"
          >
            <span style="color: #526da5">Cerrar</span>
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- <table>
          <thead>
            <tr>
              <th>Marca</th>
              <th>Modelo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="model in modelsList" :key="model.nom_modelo">
              <td>{{ model.nom_marca }}</td>
              <td>{{ model.nom_modelo }}</td>
            </tr>
          </tbody>
        </table> -->
    </v-dialog>
    <v-tabs left color="transparent">
      <v-tab>Sitio (Entrada/Salida)</v-tab>
      <div style="margin-left: auto;">
        <v-btn color="primary" flat @click="showInfo = true">
          <v-icon small style="font-size: 25px;">touch_app</v-icon>
          <h3 style="font-size: 16px; font-weight: 500;">
            Modelos Gps habilitados
          </h3>
        </v-btn>
      </div>
    </v-tabs>
    <v-divider />
    <CortaCorriente />
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import CortaCorriente from './CortaCorriente.vue';
import { LoadingService } from '@/services/loadingService';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

@Component({
  components: { CortaCorriente },
})
export default class CortaCorrientePantalla extends Vue {
  readonly loadingService = new LoadingService();
  axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);
  readonly urlPg: string = 'Metabase/PostgenericA/track_corta_corriente/';
  //@ts-ignore
  readonly $snotify: any;
  showInfo: boolean = false;
  modelsList: any[] = [];

  mounted() {
    this.getModels();
  }

  getModels() {
    this.loadingService.showLoading();
    this.axios.http
      .post(`${this.urlPg}get_modelos_permitidos`, {})
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          this.modelsList = response.data.data;
        } else {
          this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
            timeout: 3000,
          });
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al Obtener los Modelos');
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 280px;
  margin: 10px;
  background-color: #fff;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

th,
td {
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

tr:hover {
  background-color: #f5f5f5;
}

::v-deep .v-dialog {
  width: auto;
}
</style>
