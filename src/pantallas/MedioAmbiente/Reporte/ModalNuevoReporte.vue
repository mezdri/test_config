<template>
  <v-layout justify="center">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Nuevo Reporte</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-layout>
              <v-flex>
                <v-autocomplete
                  v-model="formsFields.patente"
                  :items="itemsCodVehiculo"
                  label="Patente"
                  item-text="patente_vehiculo"
                  item-value="id"
                  return-object
                />
              </v-flex>
              <v-flex>
                <DatePicker
                  :label="formsFields.fechaDesdeNew.label"
                  :error-messages="errors.collect(formsFields.fechaDesdeNew.id)"
                  :id="formsFields.fechaDesdeNew.id"
                  v-model="formsFields.fechaDesdeNew.value"
                  :min="fechaMinima"
                  :max="fechaMaxima"
                  @input="validateDates"
                  v-validate="'required'"
                />
              </v-flex>
              <v-flex>
                <DatePicker
                  :label="formsFields.fechaHastaNew.label"
                  :error-messages="errors.collect(formsFields.fechaHastaNew.id)"
                  :id="formsFields.fechaHastaNew.id"
                  v-model="formsFields.fechaHastaNew.value"
                  :min="fechaMinima"
                  :max="fechaMaxima"
                  @input="validateDates"
                  v-validate="'required'"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="onClose">
            Cancelar
          </v-btn>
          <v-btn color="blue darken-1" text @click="onSave">
            Generar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { reporteService } from '@/pantallas/MedioAmbiente/Reporte/reporteService';
import { LoadingService } from '@/services/loadingService';
import moment from 'moment/moment';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import { AxiosResponse } from 'axios';
import { MSResponse } from '@/interfaces/MS';
import { VehiculoFilterI } from '@/interfaces/Filters';
import MedioAmbienteInstance from '@/pantallas/MedioAmbiente/comunes/Instances';

@Component({
  name: 'ModalNuevoReporte',
  components: { FormFieldsContainer, DatePicker },
})
export default class ModalNuevoReporte extends Vue {
  @Prop({ default: true }) show: boolean;
  // @Prop({ default: {} }) parametros: any;
  huellaCarbonoService = new reporteService();
  dialog: boolean = false;
  isLoading: boolean = false;
  validForm: boolean = true;
  isFormValid: boolean = false;
  loadingService = new LoadingService();
  userId: number = 0;
  clientId: string = '';
  userFullName: string = '';
  $snotify: any;

  itemsCodVehiculo: VehiculoFilterI[] = [];
  formsFields: {
    patente: VehiculoFilterI;
    fechaDesdeNew: { id: string; label: string; value: any };
    fechaHastaNew: { id: string; label: string; value: any };
  } = {
    patente: {
      id: '',
      cod_vehiculo: '',
      cod_flota: '',
      patente_vehiculo: '',
    },
    fechaDesdeNew: {
      id: '1110',
      label: 'Desde',
      value: moment(new Date()).add(-5, 'days'),
    },
    fechaHastaNew: {
      id: '1111',
      label: 'Hasta',
      value: moment(new Date()),
    },
  };

  mounted() {
    const userData = JSON.parse(localStorage.getItem('user'));
    this.userId = userData.id;
    this.userFullName = `${userData.nombre} ${userData.apellidoPaterno}`;
    this.clientId = localStorage.getItem('clienteDefecto');
  }

  validateDates() {}

  get fechaMaxima() {
    const fechaMax = moment().format('YYYY-MM-DD h:mm:ss a');
    return fechaMax;
  }

  get fechaMinima() {
    let fechaMin = moment(new Date())
      .add(-12, 'months')
      .toISOString()
      .substr(0, 10);
    return fechaMin;
  }

  async getVehicles() {
    this.loadingService.showLoading();
    this.itemsCodVehiculo = [];
    const axiosResponse: AxiosResponse<
      MSResponse<VehiculoFilterI>
    > = await this.huellaCarbonoService.getVehiculos(
      this.userId,
      this.clientId
    );
    const msResponse: MSResponse<VehiculoFilterI> = axiosResponse.data;
    if (msResponse.CODIGO_RESPUESTA == '1') {
      this.itemsCodVehiculo = msResponse.data;
      this.loadingService.hideLoading();
    } else {
      this.$snotify.error(msResponse.MENSAJE_RESPUESTA, {
        timeout: 3000,
      });
      //TODO agregar notificacion notify
      this.itemsCodVehiculo = [];
      this.loadingService.hideLoading();
    }
  }

  onClose() {
    this.formsFields.patente = {
      id: '',
      cod_vehiculo: '',
      cod_flota: '',
      patente_vehiculo: '',
    };
    MedioAmbienteInstance.$emit('close');
  }

  async onSave() {
    this.loadingService.showLoading();
    if (this.formsFields.patente.patente_vehiculo == '') {
      this.$snotify.error('Debe introducir una patente');
      this.loadingService.hideLoading();
      return;
    }
    const payloads = {
      patente: this.formsFields.patente.patente_vehiculo,
      fechaDesdeNew: this.formsFields.fechaDesdeNew.value,
      fechaHastaNew: this.formsFields.fechaHastaNew.value,
      clientId: this.clientId,
      userId: this.userId,
      username: this.userFullName,
    };

    const axiosResponse: AxiosResponse<
      MSResponse<any>
    > = await this.huellaCarbonoService.saveReport(payloads);
    this.isLoading = false;
    const msRespose: any = axiosResponse.data;
    console.log(msRespose);
    if (
      !msRespose.hasOwnProperty('CODIGO_RESPUESTA') ||
      msRespose.CODIGO_RESPUESTA != '1'
    ) {
      this.$snotify.error('Error al crear el reporte');
    } else {
      this.$snotify.success(msRespose.MENSAJE_RESPUESTA);
    }
    this.loadingService.hideLoading();
    this.onClose();
  }

  @Watch('show')
  open() {
    this.dialog = this.show;
    if (this.dialog) this.getVehicles();
  }
}
</script>

<style scoped></style>
