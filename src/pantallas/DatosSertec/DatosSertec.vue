<template>
  <!-- v-show="show" -->
  <v-container fluid grid-list-md>
    <v-card>
      <v-layout row wrap class="mt-4 mx-3">
        <div align="left">
          <v-flex md12>
            <h2 class="h2_title">Ingreso de Datos Sertec</h2>
          </v-flex>
        </div>
      </v-layout>
      <v-divider></v-divider>
      <br />
      <v-form
        v-if="showForm"
        @submit.prevent="handleSubmit"
        v-model="validForm"
        lazy-validation
        class="mx-3"
      >
        <!-- lazy-validation -->
        <v-layout>
          <!-- cols="5" -->
          <v-flex class="pa-1 mx-3" cols="12" md5>
            <v-text-field
              v-model="datosSertec.nro_caso"
              name="caso"
              v-validate="'required|max:15'"
              data-vv-name="caso"
              :counter="15"
              label="N° caso"
              :error-messages="errors.collect('caso')"
              required
            ></v-text-field>
            <v-select
              name="transportista"
              v-model="datosSertec.transportista"
              :error-messages="errors.collect('transportista')"
              label="Transportista"
              :items="datosSertecDropdown.DDTransportistas"
            ></v-select>
            <v-select
              name="planta"
              :error-messages="errors.collect('planta')"
              v-model="datosSertec.planta"
              v-validate="'required'"
              label="Planta"
              :items="datosSertecDropdown.DDPlanta"
            ></v-select>
            <v-text-field
              v-model="datosSertec.patente"
              v-validate="'required'"
              label="Patente"
              name="patente"
              :error-messages="errors.collect('patente')"
              required
            ></v-text-field>
            <v-select
              v-model="datosSertec.producto"
              v-validate="'required'"
              label="Producto"
              name="produc"
              :error-messages="errors.collect('produc')"
              :items="datosSertecDropdown.DDProducto"
            ></v-select>
            <div @click="getDataPiker(0)" class="ma-6" required>
              <v-combobox
                v-model="datosSertec.fecha_origen_falla"
                label="Fecha Origen Falla"
                v-validate="'required'"
                name="fechaOrigen"
                :error-messages="errors.collect('fechaOrigen')"
                prepend-icon="event"
                required
                chips
                readonly
                deletable-chips
              >
              </v-combobox>
            </div>
            <div @click="getDataPiker(1)" class="ma-6" required>
              <v-combobox
                label="Fecha Apertura Ticket "
                v-model="datosSertec.fecha_apertura_ticket"
                v-validate="'required'"
                name="fechaApertura"
                :error-messages="errors.collect('fechaApertura')"
                prepend-icon="event"
                required
                chips
                readonly
                deletable-chips
              >
              </v-combobox>
            </div>
          </v-flex>
          <!-- cols="5" -->
          <v-flex class="pa-1 ma-3" cols="12" md5>
            <div @click="getDataPiker(2)" class="ma-6" required>
              <v-combobox
                label="Fecha Coordinación Trabajos"
                v-model="datosSertec.fecha_coordinacion_trabajos"
                v-validate="'required'"
                name="fechaApertura"
                :error-messages="errors.collect('fechaApertura')"
                prepend-icon="event"
                required
                chips
                readonly
                deletable-chips
              >
              </v-combobox>
            </div>
            <div @click="getDataPiker(3)" class="ma-6" required>
              <v-combobox
                label="Fecha Solución Definitiva "
                v-validate="'required'"
                v-model="datosSertec.fecha_solucion_definitiva"
                name="fechaSolucion"
                :error-messages="errors.collect('fechaSolucion')"
                prepend-icon="event"
                required
                chips
                readonly
                deletable-chips
              >
              </v-combobox>
            </div>
            <v-text-field
              v-model="datosSertec.horas_o_dias_en_solucion"
              v-validate="'required|numeric'"
              data-vv-name="diasSolucion"
              label="Días de Solución"
              type="numeric"
              :error-messages="errors.collect('diasSolucion')"
              required
            ></v-text-field>

            <v-select
              v-model="datosSertec.estado"
              v-validate="'required|alpha_spaces'"
              label="Estado Solicitud"
              name="estado"
              :error-messages="errors.collect('estado')"
              required
              :items="datosSertecDropdown.DDEstado"
            ></v-select>
            <v-select
              v-model="datosSertec.motivo_rechazo"
              v-validate="'required|alpha_spaces'"
              label="Motivo Rechazo"
              name="motivo"
              :items="datosSertecDropdown.DDMotivoRehazo"
            ></v-select>
            <v-select
              label="Tipo de Soporte"
              v-model="datosSertec.tipo_caso"
              v-validate="'required|alpha_spaces'"
              :error-messages="errors.collect('tipoSoporte')"
              name="tipoSoporte"
              :items="datosSertecDropdown.DDTipoSoporte"
            ></v-select>

            <v-textarea
              v-model="datosSertec.comentario"
              v-validate="'required'"
              rows="4"
              label="Comentario de Trabajo"
              name="comentario"
              :error-messages="errors.collect('comentario')"
              required
            ></v-textarea>
          </v-flex>

          <v-flex class="pa-1 ma-3" cols="12" md2>
            <v-btn color="#27488E" dark type="submit">
              <!--:disabled="invalid" <v-icon left> check </v-icon> -->
              {{ this.acciones[this.accionSeleccionada] }}
            </v-btn>
            <v-btn
              color="#27488E"
              dark
              outline
              v-if="accionSeleccionada == 1"
              @click="cancelar"
            >
              cancelar
            </v-btn>
          </v-flex>
        </v-layout>
      </v-form>
      <v-dialog v-model="dateStartDialog" max-width="290">
        <v-date-picker
          @change="dateSeleccionFin()"
          v-model="dateSelected"
          :min="minDate"
          range
          event-color="#27488E"
        ></v-date-picker>
      </v-dialog>
      <GridSertec ref="grilla" />
    </v-card>
    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import {
  IDatosSertecDropdown,
  DatosSertecDropdown,
} from '@/interfaces/DatosSertecDropdowns';
import { Validator } from 'vee-validate';
import { IDatosSertec, DatosSertecClass } from '@/interfaces/DatosSertecClass';
import config from '@/config/index';
import GridSertec from './GridSertec.vue';
import { asociacionEventBus } from '@/setup';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard';
import Confirmation from '@/components/Confirmation.vue';

@Component({
  components: {
    GridSertec,
    'app-confirmacion': Confirmation,
  },
})
export default class DatosSertec extends Vue {
  dateStartDialog: Boolean = false;
  showForm: Boolean = false;
  dictionaryFormErrors: any = {};
  validForm: boolean = false;
  dialogConfirmacionClose: boolean = false;
  dateSelected: any = null;
  fechaOrigenSelected: string = '';
  fechaAperturaelected: string = '';
  fechaCoordinacionSelected: string = '';
  fechaSolucionSelected: string = '';
  DatosSertecClass = new DatosSertecClass();
  DatosSertecDropdown = new DatosSertecDropdown();

  datePikerSelected: number = null;
  acciones: any = ['Guardar', 'guardar cambios'];
  accionSeleccionada: number = 0;
  clienteId: number = null;
  $snotify: any;
  minDate: any = '';
  datosSertec: IDatosSertec = this.DatosSertecClass.datos;
  datosSertecDropdown: IDatosSertecDropdown = this.DatosSertecDropdown.datos;

  initialize() {
    this.clienteId = parseInt(localStorage.getItem('clienteDefecto'));

    this.showForm = true;
    this.dictionaryFormErrors = {
      es: {
        custom: {
          caso: {
            required: config.errorMensajes.textoRequerido,
            max: config.errorMensajes.maxLength,
          },
          transportista: {
            required: config.errorMensajes.textoRequerido,
            max: config.errorMensajes.maxLength,
          },
          planta: {
            required: config.errorMensajes.textoRequerido,
            max: config.errorMensajes.maxLength,
          },
          patente: {
            required: config.errorMensajes.textoRequerido,
            max: config.errorMensajes.maxLength,
          },
          producto: {
            required: config.errorMensajes.textoRequerido,
            max: config.errorMensajes.maxLength,
          },
          diasSolucion: {
            required: config.errorMensajes.textoRequerido,
            max: config.errorMensajes.maxLength,
            numeric:
              '* El campo Apellido Materno solo debe contener letras y/o espacios.',
          },
          tipoSoporte: {
            alpha_num: () =>
              '* El Número de serie solo debe contener números y/o letras.',
            required: 'El soporte de ola.',
            max: config.errorMensajes.maxLength,
          },
          estado: {
            required: config.errorMensajes.textoRequerido,
            max: config.errorMensajes.maxLength,
            alpha_num:
              '* El Número de serie solo debe contener números y/o letras.',
          },
          motivo: {
            required: config.errorMensajes.textoRequerido,
            max: config.errorMensajes.maxLength,
          },
          comentario: {
            required: config.errorMensajes.textoRequerido,
            max: config.errorMensajes.maxLength,
          },
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
  confirmCallbackConfirm(val: boolean) {
    if (val) {
      this.DatosSertecClass = new DatosSertecClass();
      this.datosSertec = this.DatosSertecClass.datos;
      this.$validator.reset();
      this.accionSeleccionada = 0;
    }
    this.dialogConfirmacionClose = false;
  }
  mounted() {
    if (parseInt(localStorage.getItem('clienteDefecto')) != 3833) {
      this.showForm = false;
      return;
    }
    this.showForm = true;
    asociacionEventBus.$on('editar', (data: IDatosSertec) => {
      this.DatosSertecClass = new DatosSertecClass();
      this.datosSertec = this.DatosSertecClass.datos;
      this.datosSertec = data;
      this.accionSeleccionada = 1;
      // this.datosSertec.fecha_origen_falla = this.formatDate(
      //   this.datosSertec.fecha_origen_falla
      // );
      // this.datosSertec.fecha_apertura_ticket = this.formatDate(
      //   this.datosSertec.fecha_apertura_ticket
      // );
      // this.datosSertec.fecha_coordinacion_trabajos = this.formatDate(
      //   this.datosSertec.fecha_coordinacion_trabajos
      // );
      // this.datosSertec.fecha_solucion_definitiva = this.formatDate(
      //   this.datosSertec.fecha_solucion_definitiva
      // );
    });
    this.scrollToTop();
  }
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  getDataPiker(aux: number) {
    this.datePikerSelected = aux;
    this.dateStartDialog = true;
  }
  formatDate = (current_datetime: any) => {
    const d = new Date(0);
    let formatted_date =
      current_datetime +
      ' ' +
      d.getHours() +
      ':' +
      d.getMinutes() +
      ':' +
      d.getSeconds();
    return formatted_date;
  };
  dateSeleccionFin() {
    switch (this.datePikerSelected) {
      case 0:
        this.fechaOrigenSelected = this.formatDate(this.dateSelected);
        this.datosSertec.fecha_origen_falla = this.formatDate(
          this.dateSelected
        );
        break;
      case 1:
        this.fechaAperturaelected = this.formatDate(this.dateSelected);
        this.datosSertec.fecha_apertura_ticket = this.formatDate(
          this.dateSelected
        );
        break;
      case 2:
        this.fechaCoordinacionSelected = this.formatDate(this.dateSelected);
        this.datosSertec.fecha_coordinacion_trabajos = this.formatDate(
          this.dateSelected
        );
        break;
      case 3:
        this.fechaSolucionSelected = this.formatDate(this.dateSelected);
        this.datosSertec.fecha_solucion_definitiva = this.formatDate(
          this.dateSelected
        );
        break;
    }
    this.dateSelected = '';
    this.dateStartDialog = false;
  }
  handleSubmit() {
    this.$validator.validateAll().then(async resultado => {
      if (resultado) {
        const refGrilla = this.$refs.grilla as any;
        this.datosSertec.tipo_caso = this.datosSertec.tipo_caso.toUpperCase();
        this.datosSertec.estado = this.datosSertec.estado.toUpperCase();
        this.datosSertec.nro_caso = this.datosSertec.nro_caso.toUpperCase();
        this.datosSertec.planta = this.datosSertec.planta.toUpperCase();
        this.datosSertec.producto = this.datosSertec.producto.toUpperCase();
        this.datosSertec.patente = this.datosSertec.patente.toUpperCase();
        this.datosSertec.transportista = this.datosSertec.transportista.toUpperCase();
        this.datosSertec.estado = this.datosSertec.estado.toUpperCase();
        this.datosSertec.nro_caso = this.datosSertec.nro_caso.toUpperCase();
        this.datosSertec.motivo_rechazo = this.datosSertec.motivo_rechazo.toUpperCase();
        this.datosSertec.comentario = this.datosSertec.comentario
          .split('\n')
          .join(' ');
        let url = 'mantenedor_sertec/agregar_editar';
        this.datosSertec = {
          ...this.datosSertec,
          id_cliente: this.clienteId,
          segmentacion: 'esmax',
        };
        let result = await fetchDashboard(this.datosSertec, url);
        result.data.CODIGO_RESPUESTA == 1
          ? (this.$snotify.success(result.data.MENSAJE_RESPUESTA),
            (this.DatosSertecClass = new DatosSertecClass()),
            (this.datosSertec = this.DatosSertecClass.datos),
            this.$validator.reset(),
            refGrilla.getGrilla(),
            (this.accionSeleccionada = 0))
          : this.$snotify.error(result.data.MENSAJE_RESPUESTA);
      }
    });
  }
  cancelar() {
    this.dialogConfirmacionClose = true;
  }
  async fetchDashboard(body: any, path: any) {
    let response = await fetchDashboard(body, path);
    return response;
  }
  quitarAcentos(cadena: string) {
    const acentos: any = {
      á: 'a',
      é: 'e',
      í: 'i',
      ó: 'o',
      ú: 'u',
      Á: 'A',
      É: 'E',
      Í: 'I',
      Ó: 'O',
      Ú: 'U',
    };
    return cadena
      .split('')
      .map(letra => acentos[letra] || letra)
      .join('')
      .toString();
  }
}
</script>
