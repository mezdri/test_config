<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="closeModal(false)">
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Rol</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark flat @click="continuar()">Continuar</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <br />

        <v-layout>
          <v-flex xs12 sm6 offset-sm3>
            <v-card>
              <v-card-title primary-title>
                <div>
                  <h3 class="headline mb-0">Columnas de datos disponibles</h3>
                </div>
              </v-card-title>

              <v-card-actions>
                <v-data-table
                  :headers="headers"
                  :items="items"
                  :pagination.sync="pagination"
                  :rows-per-page-items="rowsPerPage"
                  rows-per-page-text="Filas por página"
                  class="elevation-1"
                >
                  <template slot="items" slot-scope="props">
                    <td class="text-xs-left">{{ props.item.columna }}</td>
                    <td class="text-xs-left">
                      <v-text-field
                        v-model="props.item.orden"
                        type="number"
                        min="1"
                        max="99"
                      ></v-text-field>
                    </td>
                    <td class="justify-center layout px-2">
                      <v-switch v-model="props.item.estado"></v-switch>
                    </td>
                  </template>
                </v-data-table>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '../../config/index';
import HandleErrors from '../../config/handleErrors';
import Confirmation from '../../components/Confirmation.vue';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { eventBus } from '@/setup';

@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class ConfigurarVistaActual extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: [] }) columnas!: any;

  dialog: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);
  card_text: string =
    'Lorem ipsum dolor sit amet, brute iriure accusata ne mea. Eos suavitate referrentur ad, te duo agam libris qualisque, utroque quaestio accommodare no qui. Et percipit laboramus usu, no invidunt verterem nominati mel. Dolorem ancillae an mei, ut putant invenire splendide mel, ea nec propriae adipisci. Ignota salutandi accusamus in sed, et per malis fuisset, qui id ludus appareat.';
  headers: any = [
    { text: 'Columna', value: 'columna', width: '500' },
    { text: 'Orden', value: 'orden' },
    { text: 'Estado', value: 'estado' },
  ];
  items: any = [];
  pagination: any = {
    rowsPerPage: -1,
  };
  rowsPerPage: any = [5, 10, 25, { text: 'Todos', value: -1 }];

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.items = [
      {
        columna: 'Frozen Yogurt',
        orden: 159,
        estado: true,
      },
      {
        columna: 'Frozen Yogurt',
        orden: 159,
        estado: false,
      },
      {
        columna: 'Frozen Yogurt',
        orden: 159,
        estado: false,
      },
      {
        columna: 'Frozen Yogurt',
        orden: 159,
        estado: true,
      },
      {
        columna: 'Frozen Yogurt',
        orden: 159,
        estado: false,
      },
    ];
  }

  closeModal(val: boolean) {
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
  }
}
</script>
