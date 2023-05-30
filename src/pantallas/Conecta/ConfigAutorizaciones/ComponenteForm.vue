<template>
  <div align="center">
    <v-flex md10>
      <v-card>
        <v-container grid-list-md>
          <div align="left">
            <v-flex md12>
              <h2>
                {{
                  creacion
                    ? 'Crear Configuración de Autorizaciones'
                    : edicion
                    ? 'Editar Configuración de Autorizaciones'
                    : visualizacion
                    ? 'Ver Configuración de Autorizaciones'
                    : ''
                }}
              </h2>
            </v-flex>
          </div>
          <v-divider></v-divider>
          <br />
          <div id="divCont">
            <v-flex class="fle">
              <v-text-field
                type="number"
                label="Número de Orden *"
                v-model="nroOrden"
                @input="emitirParaGuardar"
                :disabled="!(creacion || edicion)"
                dense
                required
              />
            </v-flex>
            <v-flex class="fle">
              <v-combobox
                label="Usuario *"
                v-model="usuario"
                :items="listaUsuarios"
                item-text="nombrecompleto"
                item-value="id"
                @change="emitirParaGuardar"
                :disabled="!(creacion || edicion)"
                dense
                required
              />
            </v-flex>
            <v-flex class="fle">
              <v-combobox
                label="Operación *"
                v-model="operacion"
                :items="listaOperaciones"
                item-text="configdescripcion"
                item-value="configid"
                @change="emitirParaGuardar"
                :disabled="!(creacion || edicion)"
                dense
                required
              />
            </v-flex>
          </div>
          <div id="divCont">
            <v-flex class="fle">
              <DatePicker
                label="Fecha de Inicio *"
                v-model="fechaInicio"
                @input="emitirParaGuardar"
                :disabled="visualizacion"
                required
              />
            </v-flex>
            <v-flex class="fle">
              <v-checkbox
                label="Por tiempo indefinido"
                @change="emitirParaGuardar"
                v-model="indefinido"
                :disabled="visualizacion"
              ></v-checkbox>
            </v-flex>
            <v-flex class="fle">
              <DatePicker
                label="Fecha de Fin *"
                v-model="fechaFin"
                @input="emitirParaGuardar"
                :disabled="visualizacion || indefinido"
                required
              />
            </v-flex>
          </div>
          <div id="divCont">
            <v-flex class="fle">
              <v-textarea
                label="Observación"
                v-model="observacion"
                @input="emitirParaGuardar"
                :disabled="!(creacion || edicion)"
                class="textAreaForm"
                no-resize
              />
            </v-flex>
          </div>
        </v-container>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { fetchConfigAutorizaciones } from './fetchConfigAutorizaciones';
import { LoadingService } from '@/services/loadingService';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import moment from 'moment';

@Component({ components: { DatePicker } })
export default class ComponenteForm extends Vue {
  @Prop({ default: () => ({}) }) data: any;

  @Prop({ default: [] }) listaOperaciones: any;

  listaUsuarios: any = [];

  @Prop({ default: false }) creacion: Boolean;
  @Prop({ default: false }) edicion: Boolean;
  @Prop({ default: false }) visualizacion: Boolean;

  /// CAMPOS ///
  userID = JSON.parse(localStorage.getItem('user')).id;
  fechaHoy = moment();
  fechaInicio = moment();
  fechaFin = moment().add(1, 'year');
  usuario: any = '';
  operacion: any = '';
  observacion = '';
  nroOrden: any = 1;
  nroConfig: any = 0;
  indefinido = false;
  /// FIN CAMPOS ///

  loadingService = new LoadingService();
  $snotify: any;

  mounted() {
    this.getComboPublicUsuarios();
    if (this.edicion || this.visualizacion) {
      let data = this.data[0];
      console.log(data);
      this.nroConfig = data.numeroconfig;
      this.nroOrden = data.numeroorden;
      this.observacion = data.autoobserva;
      this.operacion = data.configdescripcion;
      this.usuario = data.usuariocompleto;
      this.fechaInicio = moment(data.autofecha_inicio);
      if (data.autofecha_fin) this.fechaFin = moment(data.autofecha_fin);
      else {
        this.fechaFin = undefined;
        this.indefinido = true;
      }
    }
  }

  getComboPublicUsuarios() {
    this.loadingService.showLoading(undefined, 'getComboPublicUsuarios');
    fetchConfigAutorizaciones('getComboPublicUsuarios', {})
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.listaUsuarios = data.data.data;
          console.log(this.listaUsuarios);
        } else this.listaUsuarios = [];
      })
      .catch((err: any) => console.error(err))
      .finally(() => this.loadingService.hideLoading('getComboPublicUsuarios'));
  }

  emitirParaGuardar() {
    let obj = {
      userID: this.userID ? this.userID : null,
      usuarioSeleccionado: this.usuario.id ? this.usuario.id : null,
      operacion: this.operacion.configid ? this.operacion.configid : null,
      observacion: this.observacion ? this.observacion : null,
      fechaHoy: this.fechaHoy ? this.fechaHoy : null,
      fechaInicio: this.fechaInicio ? this.fechaInicio : null,
      fechaFin: this.indefinido ? null : this.fechaFin,
      numeroOrden: this.nroOrden ? this.nroOrden : 1,
      numeroConfig: this.nroConfig ? this.nroConfig : null,
    };
    if (this.creacion) this.$emit('objCreacion', obj);
    if (this.edicion) this.$emit('objEdicion', obj);
  }
}
</script>

<style scoped>
h2 {
  margin-top: 12px !important;
  font-weight: normal;
}

#divCont {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-wrap: wrap;
}

.fle {
  margin: 1.8rem 1rem;
  width: 20rem;
}

.textAreaForm {
  height: 100px;
}
</style>
