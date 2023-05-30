<template>
  <div>
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Crear VOD">
              <slot name="prependInformacionGeneral" />
              <v-flex xs12 sm6 md6>
                <v-autocomplete
                  class="tfClassModal"
                  :items="formFields.patent.items"
                  v-model="formFields.patent.value"
                  :label="formFields.patent.label"
                  item-text="desc"
                  item-value="cod"
                  v-validate="'required'"
                  data-vv-name="patenteRequeridaCrear"
                  @change="changePatent"
                  :error-messages="errors.collect('patenteRequeridaCrear')"
                  required
                  :closeOnContentClick="true"
                >
                  <template v-slot:item="data"
                    ><v-btn
                      style="height:100%; width: 113%; margin-left: -15px ; background: white;"
                      elevation="0"
                    >
                      <v-list-tile>
                        <v-list-tile-content
                          style="overflow: visible !important"
                        >
                          <div
                            style="display: flex; margin-left: 5%; margin-right: 5%; cursor: pointer !important;"
                          >
                            <i
                              class="material-icons"
                              id="5545"
                              :title="getStateString(data.item.estado)"
                              :style="getHtmlFromState(data.item.estado)"
                            ></i>
                            <div
                              style="padding-left: 16px; margin-top: 2%;"
                              class="tooltipModal"
                            >
                              <span style=" margin-top: 4%">
                                {{
                                  textoComprimido(
                                    data.item.patente +
                                      ' [' +
                                      data.item.cod +
                                      ']'
                                  )
                                }}</span
                              >&nbsp;
                              <span class="tooltiptextModal">{{
                                data.item.patente + ' [' + data.item.cod + ']'
                              }}</span>
                            </div>
                          </div>
                        </v-list-tile-content>
                      </v-list-tile>
                    </v-btn>
                  </template>
                </v-autocomplete>
              </v-flex>
              <v-flex xs12 sm6 md6></v-flex>
              <v-flex xs12 sm6 md6>
                <DateComponent
                  :label="formFields.dateStart.label"
                  class="tfClassModal"
                  v-model="formFields.dateStart.value"
                  v-validate="'required'"
                  data-vv-name="fechaRequeridaCrear"
                  :error-messages="errors.collect('fechaRequeridaCrear')"
                  required
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <TimeComponent
                  :label="formFields.timeStart.label"
                  class="tfClassModal"
                  v-model="formFields.timeStart.value"
                  v-validate="'required'"
                  data-vv-name="horaRequeridaCrear"
                  :error-messages="errors.collect('horaRequeridaCrear')"
                  required
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <DateComponent
                  :label="formFields.dateEnd.label"
                  class="tfClassModal"
                  v-model="formFields.dateEnd.value"
                  v-validate="'required'"
                  data-vv-name="fechaFinRequeridaCrear"
                  :error-messages="errors.collect('fechaFinRequeridaCrear')"
                  required
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <TimeComponent
                  :label="formFields.timeEnd.label"
                  class="tfClassModal"
                  v-model="formFields.timeEnd.value"
                  v-validate="'required'"
                  data-vv-name="horaFinRequeridaCrear"
                  :error-messages="errors.collect('horaFinRequeridaCrear')"
                  required
                />
              </v-flex>
            </FormFieldsContainer>
            <v-flex xs12 sm12 md12 wrap layout>
              <v-flex></v-flex>
              <v-flex xs12 sm6 md6 wrapper-files>
                <div
                  style="width: 100%; display: flex; justify-content: flex-end;"
                >
                  <v-btn
                    @click="handleClick"
                    color="#ffe800"
                    style="height: 47px;"
                  >
                    <v-icon left dark icon>add</v-icon> Crear VOD
                  </v-btn>
                </div>
              </v-flex>
            </v-flex>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { LoadingService } from '@/services/loadingService';
import { fetchCamaraModulo } from '@/pantallas/Camaras/fetchCamaraModulos';
import CamaraEventBus from '@/pantallas/Camaras/CamaraEventBus';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import moment from 'moment';

@Component({
  components: {
    DateComponent: DatePicker,
    TimeComponent: TimePicker,
    FormFieldsContainer,
  },
})
export default class CrearVODForm extends Vue {
  // @Prop({ default: false }) openDialog!: boolean;
  loadingService = new LoadingService();
  dialog: boolean = false;
  channelSelect: any[] = [];
  channelsDict: { [id_channel: string]: string[] } = {};
  isFormValid: boolean = true;
  $snotify: any;
  formFields: {
    patent: any;
    channel: any;
    dateStart: any;
    timeStart: any;
    dateEnd: any;
    timeEnd: any;
  } = {
    patent: {
      label: 'Patente/Camara',
      value: '',
      items: [],
      patent: '',
    },
    channel: {
      label: 'Canales',
      value: '',
    },
    dateStart: {
      label: 'Fecha desde',
      value: '',
    },
    timeStart: {
      label: 'Hora desde',
      value: '',
    },
    dateEnd: {
      label: 'Fecha hasta',
      value: '',
    },
    timeEnd: {
      label: 'Hora hasta',
      value: '',
    },
  };

  mounted() {
    this.getChannels();
    this.chargePatentsCamera();
  }

  async getChannels() {
    this.loadingService.showLoading();
    var self = this;
    fetchCamaraModulo({}, 'getChannels')
      .then((response: any) => {
        this.channelsDict = response.data.data;
      })
      .catch((error: any) => {
        console.log(error);
      })
      .finally(() => {
        self.loadingService.hideLoading();
      });
  }

  changeValuePatent(data: any) {
    this.formFields.patent.value = data.cod;
  }

  getStateString(state: string): string {
    var stateString: string = '';
    if (state == 'Linea') {
      stateString = 'En Línea';
    } else if (state == 'Desconecta') {
      stateString = 'Desconectado';
    } else if (state == 'Sin Info') {
      stateString = 'Sin Información';
    }
    return stateString;
  }

  textoComprimido(item: any) {
    let retorno: string = '';
    if (item.length > 14) {
      retorno = item.substr(0, 13) + '...';
    } else {
      retorno = item;
    }
    return retorno;
  }

  getHtmlFromState(state: string): string {
    const style =
      'width: 24px; height: 24px;margin-top: 2%; border-radius: 50%; ';
    var html = '';
    var css = '';
    if (state == 'Linea') {
      css = style + ' background: rgb(42, 255, 78)';
    } else if (state == 'Desconecta') {
      css = style + ' background: rgb(255, 58, 58)';
    } else if (state == 'Sin Info') {
      css = style + ' background: rgb(33, 33, 255)';
    }
    return css;
  }

  async handleClick() {
    const resultadoValidacion = await this.$validator.validateAll();
    if (resultadoValidacion) {
      const date_start = moment(this.formFields.dateStart.value.toString())
        .format('YYYY-MM-DD')
        .toString();
      const time_start =
        moment(this.formFields.timeStart.value.toString())
          .format('HH:mm')
          .toString() + ':00';
      const date_end = moment(this.formFields.dateEnd.value.toString())
        .format('YYYY-MM-DD')
        .toString();
      const time_end =
        moment(this.formFields.timeEnd.value.toString())
          .format('HH:mm')
          .toString() + ':00';

      const body = {
        //id_cliente: this.getClientID().toString(),
        id_cliente: this.getClientID(),
        id_camara: this.formFields.patent.value,
        channel: this.formFields.channel.value,
        fecha_inicio: date_start + ' ' + time_start,
        fecha_fin: date_end + ' ' + time_end,
        //patente: this.patentFormat,
      };
      //CamaraEventBus.$emit('postVOD', body);
      this.postVOD(body);
    }
  }

  async postVOD(body: any) {
    this.loadingService.showLoading();
    //const body: {} = {id_cliente: this.getClientID()};
    var self = this;
    fetchCamaraModulo(body, 'postVOD')
      .then((response: any) => {
        console.log(response.data);
        if (response.data.CODIGO_RESPUESTA == '2') {
          if (response.data.hasOwnProperty('MENSAJE_RESPUESTA')) {
            this.$snotify.error(response.data.MENSAJE_RESPUESTA);
          } else {
            this.$snotify.error('Hubo un error al crear el VOD');
          }
        } else {
          if (response.data.id_solicitud != 'without_id') {
            this.$snotify.success('El VOD se ha creado con éxito');
            CamaraEventBus.$emit('postVOD', body);
          } else {
            this.$snotify.error('Hubo un error al crear el VOD');
          }
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Hubo un error al crear el VOD');
      })
      .finally(() => {
        self.loadingService.hideLoading();
      });
  }

  clearFormfields() {
    this.formFields.patent.value = '';
    this.formFields.channel.value = '';
    this.formFields.dateStart.value = '';
    this.formFields.timeStart.value = '';
    this.formFields.dateEnd.value = '';
    this.formFields.timeEnd.value = '';
    this.$validator.reset();
  }

  changePatent() {
    this.formFields.channel.value = '';
    this.channelSelect = this.channelsDict[this.formFields.patent.value];
  }

  // changePatent() {
  //   this.formFields.channel.value = '';
  //   if (this.formFields.patent.value != '') {
  //     const camara = this.formFields.patent.value
  //       .toString()
  //       .split(' ')[1]
  //       .slice(1, -1);
  //       this.channelSelect = this.channelsDict[camara];
  //   }else{
  //     this.channelSelect = this.channelsDict[""];
  //   }
  // }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
  }

  async chargePatentsCamera() {
    this.loadingService.showLoading();
    const body: {} = { id_cliente: this.getClientID() };
    var self = this;
    fetchCamaraModulo(body, 'getPatentCameras')
      .then((response: any) => {
        self.formFields.patent.items = response.data.data || [];
      })
      .catch((error: any) => {
        console.log(error);
      })
      .finally(() => {
        self.loadingService.hideLoading();
      });
  }

  // @Watch('openDialog')
  // onDialogChanged(value: boolean, lastValue: boolean) {
  //   this.clearFormfields();
  //   this.dialog = value;
  // }

  closeDialog() {
    CamaraEventBus.$emit('closeDialog');
  }

  get cameraFormat(): string {
    return this.formFields.patent.value
      .toString()
      .split(' ')[1]
      .slice(1, -1);
  }
}
</script>

<style scoped>
.separateDivModal {
  width: 100%;
  height: 33%;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* .tfClassModal {
  width: 25%;
  position: fixed;
  overflow: hidden;
} */
.separatorTfDivsModal {
  width: 25%;
  display: flex;
  background: transparent;
  margin: 5%;
}

.tooltipModal {
  position: relative;
  display: inline-block;
}

/* Tooltip text */
.tooltipModal .tooltiptextModal {
  visibility: hidden;
  max-width: 300px;
  min-width: 150px;
  top: 100%;
  left: 50%;
  margin-left: -60px;
  background-color: #7e7e7e;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  transition-delay: 0s;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltipModal:hover .tooltiptextModal {
  visibility: visible;
  -webkit-transition-delay: 0s;
  -moz-transition-delay: 0s;
  -ms-transition-delay: 0s;
  -o-transition-delay: 0s;
  transition-delay: 0.5s;
}
</style>
