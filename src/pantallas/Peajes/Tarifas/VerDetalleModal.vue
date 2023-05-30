<template>
  <ModalMantenedor :show="show" style="overflow-y: hidden;">
    <CabeceraModal
      titulo="Editar Peaje"
      @cerrar="handleCerrar"
      v-show="!verDetalle"
    >
      <v-btn
        class="btn-grabar"
        color="#526da5"
        @click="confirm = true"
        v-show="!verDetalle"
      >
        <span style="color: white;">Guardar Cambios</span>
      </v-btn>
    </CabeceraModal>
    <CabeceraModal
      titulo="Ver Peaje"
      @cerrar="handleCerrar"
      v-show="verDetalle"
    >
    </CabeceraModal>
    <v-dialog v-model="confirm" persistent :max-width="400">
      <v-card>
        <v-toolbar style="font-size:17px;" dark color="primary">
          Guardar Cambios
        </v-toolbar>
        <divider></divider>
        <v-card-text>
          <div style="width: 100%; ">
            <div>
              Al guardar los cambios, las tarifas que se encuentren señaladas en
              rojo serán eliminadas.
            </div>
            <br />
            <div>¿Desea continuar?</div>
          </div>
        </v-card-text>
        <divider></divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="white" small @click="confirm = false">
            <span style="color: #526da5;">Cancelar</span>
          </v-btn>
          <v-btn color="#526da5" small @click="sendData()">
            <span style="color: white;">Aceptar</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card height="55px" flat>
      <v-bottom-nav
        :value="true"
        absolute
        color="transparent"
        :active.sync="seleccionado"
      >
        <v-btn
          v-b-tooltip.hoover
          :title="categorias[0]"
          v-show="true"
          @click="handleShowPermisos(0)"
          color="primary"
          flat
        >
          <span>Categoría 1</span>
          <v-icon>directions_car</v-icon>
        </v-btn>
        <v-btn
          v-b-tooltip.hoover
          :title="categorias[1]"
          v-show="true"
          @click="handleShowPermisos(1)"
          color="primary"
          flat
        >
          <span>Categoría 2</span>
          <v-icon>airport_shuttle</v-icon>
        </v-btn>
        <v-btn
          v-b-tooltip.hoover
          :title="categorias[2]"
          v-show="true"
          @click="handleShowPermisos(2)"
          color="primary"
          flat
        >
          <span>Categoría 3</span>
          <v-icon>local_shipping</v-icon>
        </v-btn>
        <v-btn
          v-b-tooltip.hoover
          :title="categorias[3]"
          v-show="true"
          @click="handleShowPermisos(3)"
          color="primary"
          flat
        >
          <span>Categoría 4</span>
          <v-icon>motorcycle</v-icon>
        </v-btn>
      </v-bottom-nav>

      <v-btn
        v-b-tooltip.hoover
        title="Agregar Tarifas"
        color="primary"
        class="ma-2"
        @click="dialog = true"
        fab
        large
        right
        absolute
        v-show="!verDetalle"
      >
        <v-icon>add</v-icon>
      </v-btn>
    </v-card>
    <br />

    <v-card class="card" style="width: 85%; height: 70vh; overflow-y: auto;">
      <v-layout row wrap>
        <v-flex
          v-for="(item, index) in detalleSeleccionado[seleccionado]"
          :key="item.id"
          style="width: 50%;"
        >
          <v-card
            class="card"
            :style="item.css"
            style="width: 97%; padding: 5%; display: flex; margin-bottom: 15px;"
          >
            <v-flex style="margin-right: 3px;">
              <v-autocomplete
                :items="item.nom_tipotarifa"
                label="Tipo Tarifa"
                v-model="item.nom_tipotarifa"
                disabled
                :value="item.nom_tipotarifa"
              ></v-autocomplete>
              <v-text-field
                :style="onDelete(index)"
                color="error"
                label="Precio"
                prefix="$"
                type="number"
                min="0"
                required
                disabled
                v-model="item.val_precio"
                :value="item.val_precio"
              ></v-text-field>
              <v-text-field
                type="text"
                disabled
                label="Hora Inicio"
                :value="item.val_hora_inicio"
              />
              <v-text-field
                type="text"
                disabled
                label="Hora Fin"
                :value="item.val_hora_fin"
              />
            </v-flex>
            <v-flex style="margin-right: 10px;">
              <v-text-field
                type="text"
                disabled
                label="Fecha Inicio Vigencia"
                :value="item.fec_inicio_vigencia"
                format="YYYY-MM-DD"
              />
              <v-text-field
                disabled
                type="text"
                label="Fecha Fin Vigencia"
                :value="item.fec_fin_vigencia"
                format="YYYY-MM-DD"
              />
              <v-autocomplete
                disabled
                :items="dias"
                label="Tipo Día"
                v-model="item.nom_tipodia"
                :value="item.nom_tipodia"
              ></v-autocomplete>
              <div>
                <v-btn
                  color="error"
                  @click="cambiarEstado(index, 2)"
                  v-show="item.estado == 1 && !verDetalle"
                  large
                  >Borrar</v-btn
                >
                <v-btn
                  color="warning"
                  @click="cambiarEstado(index, 1)"
                  v-show="item.estado == 2 && !verDetalle"
                  large
                  >Restaurar</v-btn
                >
              </div>
            </v-flex>
          </v-card>
        </v-flex>
      </v-layout>
    </v-card>

    <br />
    <v-dialog v-model="dialog" width="650px">
      <v-card class="card" style="width: 100%;">
        <v-autocomplete
          :items="tipoTarifas"
          label="Tipo Tarifa"
          required
          v-model="tipotarifa"
        ></v-autocomplete>
        <v-autocomplete
          :items="dias"
          label="Tipo Día"
          required
          v-model="dia"
        ></v-autocomplete>
        <v-text-field
          label="Precio"
          prefix="$"
          type="number"
          min="0"
          required
          v-model="precio"
        ></v-text-field>
        <TimePicker label="Hora Inicio" required v-model="inicio" />
        <TimePicker label="Hora Fin" required v-model="fin" min="inicio" />
        <DatePicker
          label="Fecha Inicio Vigencia"
          required
          v-model="fechainicio"
        />
        <DatePicker
          label="Fecha Fin Vigencia"
          required
          v-model="fechafin"
          :min="mindate"
        />
        <v-btn
          class="btn-grabar"
          color="Green"
          @click="
            agregarTarifa();
            dialog = false;
          "
        >
          <span style="color: white;">Guardar</span>
        </v-btn>
      </v-card>
    </v-dialog>
  </ModalMantenedor>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
const { AgGridVue } = require('ag-grid-vue');

import { fetchDias, postTarifas, MsResponseData } from './fetchData';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import { split } from 'lodash';
import moment from 'moment';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    // DetalleForm,
    // TablaInfoGral,
    'ag-grid-vue': AgGridVue,
    DatePicker,
    TimePicker,
  },
})
export default class VerDetalleModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ required: true }) detalleSeleccionado: any;
  @Prop({ required: true }) peajeSeleccionado: number;
  @Prop({ required: true }) verDetalle: boolean;

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  requestsStart: number = 0;
  MsResponseData: MsResponseData = null;
  tipotarifa: string = '';
  inicio: any = null;
  fin: any = null;
  fechainicio: any = null;
  fechafin: any = null;
  precio: number = 0;
  dia: string = '';
  dias: any = [];
  dialog: boolean = false;
  confirm: boolean = false;
  mindate: any = moment().format('YYYY-MM-DD h:mm:ss a');

  tipoTarifas = [
    'TBFP - Tarifa Base Fuera de Punta',
    'TBP - Tarifa Base Punta',
    'TS - Tarifa Saturación',
    'TN - Tarifa Normal',
  ];
  // tipoTarifas = ['TBFP', 'TBP', 'TS', 'TN'];
  categorias = [
    'Auto, Auto Con Remolque, Station Wagon, Station Wagon con Remolque',
    'Bus de Dos Ejes, Camión de Dos Ejes',
    'Bus de Más de Dos Ejes, Camión de Más de Dos Ejes',
    'Moto, Motoneta',
  ];

  seleccionado: number = 0;

  handleCerrar() {
    this.$emit('cerrar');
  }

  sendData() {
    this.enviaDatos(this.peajeSeleccionado, this.detalleSeleccionado);
    // this.handleCerrar();
  }

  async enviaDatos(id_peaje: number, data: any) {
    this.MsResponseData = (await this.postTarifas(id_peaje, data)) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
          this.$store.commit('setApplicationUptaded');
          this.handleCerrar();
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  postTarifas(id_peaje: number, data: any) {
    this.showLoading();
    return postTarifas(id_peaje, data)
      .catch(error => {
        this.$snotify.error('Error de conexión');
        return;
      })
      .finally(() => this.hideLoading());
  }

  handleShowPermisos(selected: number) {
    this.seleccionado = selected;
  }

  minfecha() {
    if (this.fechainicio == null) {
      return this.mindate;
    } else {
      console.log(moment(this.fechainicio));
      return moment(this.fechainicio);
    }
  }

  showLoading() {
    this.requestsStart += 1;
    if (this.requestsStart == 1) {
      this.loadingService.showLoading();
    }
  }
  hideLoading() {
    this.requestsStart -= 1;
    if (this.requestsStart == 0) {
      this.loadingService.hideLoading();
    }
  }

  mounted() {
    this.buscaDias();
  }

  cambiarEstado(index: number, estado: number) {
    this.detalleSeleccionado[this.seleccionado][index]['estado'] = estado;
    if (estado == 2) {
      this.detalleSeleccionado[this.seleccionado][index]['css'] =
        'border:1px solid red;width: 97%; padding: 5%; display: flex; margin-bottom: 15px;';
    } else {
      this.detalleSeleccionado[this.seleccionado][index]['css'] =
        'width: 97%; padding: 5%; display: flex; margin-bottom: 15px;';
    }
  }

  agregarTarifa() {
    var tarifa = {
      id_peaje: this.peajeSeleccionado,
      nom_tipotarifa: split(this.tipotarifa, ' ')[0],
      val_precio: this.precio.toString(),
      val_hora_inicio: this.inicio.format('h:mm:00'),
      val_hora_fin: this.fin.format('h:mm:00'),
      nom_tipodia: this.dia,
      id_categoria: this.seleccionado + 1,
      fec_inicio_vigencia: this.fechainicio.format('YYYY-MM-DD'),
      fec_fin_vigencia: this.fechafin.format('YYYY-MM-DD'),
      id_horario: 0,
      estado: '1',
    };
    this.detalleSeleccionado[this.seleccionado].push(tarifa);
    this.tipotarifa = '';
    this.precio = 0;
    this.inicio = '';
    this.fin = '';
    this.dia = '';
  }

  async buscaDias() {
    this.MsResponseData = (await this.fetchDias()) || null;
    if (this.MsResponseData !== null) {
      if (this.MsResponseData.CODIGO_RESPUESTA == '1') {
        if (this.MsResponseData.data.length > 0) {
          for (let i = 0; i < this.MsResponseData.data.length; i++) {
            this.dias.push(this.MsResponseData.data[i].nom_tipodia);
          }
        } else {
          this.$snotify.error('No se han encontrado registros.', {
            timeout: 3000,
          });
        }
      } else {
        this.$snotify.error(this.MsResponseData.MENSAJE_RESPUESTA, {
          timeout: 3000,
        });
      }
    }
  }

  onDelete(index: number) {
    if (this.detalleSeleccionado[this.seleccionado][index]['estado'] == 2) {
      return "color: 'error';";
    } else {
      return;
    }
  }

  fetchDias() {
    this.showLoading();
    return fetchDias()
      .catch(error => {
        this.$snotify.error('Error');
        return;
      })
      .finally(() => this.hideLoading());
  }
}
</script>
<style scoped>
.card {
  width: 60%;
  margin: auto;
  padding: 1rem 5rem;
}
.btn {
  display: flex;
  justify-content: center;
}
</style>
