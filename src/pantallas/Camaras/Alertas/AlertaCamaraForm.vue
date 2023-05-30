<template>
  <div align="center" class="vigilanti">
    <v-flex md10 v-show="!show_zoom">
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md>
            <FormFieldsContainer titulo="Detalle Alerta">
              <slot name="prependInformacionGeneral" />
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.alerta.label"
                  v-model="formFields.alerta.value"
                  :data-vv-name="formFields.alerta.id"
                  :id="formFields.alerta.id"
                  :disabled="isVerDetalle"
                  :error-messages="errors.collect(formFields.alerta.id)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.patente.label"
                  v-model="formFields.patente.value"
                  :data-vv-name="formFields.patente.id"
                  :id="formFields.patente.id"
                  :disabled="isVerDetalle"
                  :error-messages="errors.collect(formFields.patente.id)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.tipoAlerta.label"
                  v-model="formFields.tipoAlerta.value"
                  :data-vv-name="formFields.tipoAlerta.id"
                  :id="formFields.tipoAlerta.id"
                  :disabled="isVerDetalle"
                  :error-messages="errors.collect(formFields.tipoAlerta.id)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.latitud.label"
                  v-model="formFields.latitud.value"
                  :data-vv-name="formFields.latitud.id"
                  :id="formFields.latitud.id"
                  :disabled="isVerDetalle"
                  :error-messages="errors.collect(formFields.latitud.id)"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.longitud.label"
                  v-model="formFields.longitud.value"
                  :data-vv-name="formFields.longitud.id"
                  :id="formFields.longitud.id"
                  :disabled="isVerDetalle"
                  :error-messages="errors.collect(formFields.longitud.id)"
                />
              </v-flex>
            </FormFieldsContainer>
            <v-flex xs12 sm12 md12>
              <h2
                style="font-weight: normal;margin: 12px 0px 0px; text-align:left;"
              >
                Ubicación
              </h2>
              <hr class="v-divider theme--light" style="margin-bottom:20px;" />
            </v-flex>
            <v-flex md12>
              <div id="mapContainer" class="mapContainer"></div>
            </v-flex>

            <v-flex xs12 sm12 md12>
              <h2
                style="font-weight: normal;margin: 12px 0px 0px; text-align:left;"
              >
                Archivos
              </h2>
              <hr class="v-divider theme--light" style="margin-bottom:20px;" />
            </v-flex>
            <v-flex xs12 sm12 md12 wrap layout>
              <h3
                v-if="files.length == 0"
                style="font-weight: normal;margin: 12px 0px 0px; text-align:center;"
              >
                Sin Archivos multimedia
              </h3>
              <v-flex
                xs12
                sm6
                md6
                wrapper
                wrapper-files
                v-for="file in files"
                :key="file.url"
              >
                <video
                  v-if="
                    file.url
                      .split('.')
                      .pop()
                      .toLowerCase() == 'mp4'
                  "
                  width="100%"
                  controls
                  disablepictureinpicture
                  controlslist="nodownload noplaybackrate"
                  muted
                  @contextmenu="handlerContexTmenu($event)"
                >
                  <source :src="file.url" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <img
                  v-else
                  :src="file.url"
                  width="100%"
                  @click="zoom(file.url)"
                  style="cursor:pointer"
                />
                <v-flex xs12 sm6 md6 buttons-img>
                  <v-btn
                    v-if="
                      file.url
                        .split('.')
                        .pop()
                        .toLowerCase() != 'mp4'
                    "
                    flat
                    icon
                    small
                    @click="zoom(file.url)"
                  >
                    <v-icon icon>zoom_in</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="
                      file.url
                        .split('.')
                        .pop()
                        .toLowerCase() != 'mp4'
                    "
                    flat
                    icon
                    small
                    @click="download_img(file.url)"
                  >
                    <v-icon icon>download</v-icon>
                  </v-btn>
                </v-flex>
              </v-flex>
            </v-flex>
            <br />
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
    <v-flex v-show="show_zoom" imagezoom xs10 sm10 md10>
      <v-flex imagezoom-buttons xs12 sm12 md12>
        <v-btn flat icon small @click="zoom_out">
          <v-icon icon>zoom_out</v-icon>
        </v-btn>
        <v-btn flat icon small @click="zoom_in">
          <v-icon icon>zoom_in</v-icon>
        </v-btn>
        <v-btn flat icon small @click="download_img(urlzoom)">
          <v-icon icon>download</v-icon>
        </v-btn>
        <v-btn flat icon small @click="zoom_close" style="float: right;">
          <v-icon icon>close</v-icon>
        </v-btn>
      </v-flex>
      <v-flex imagezoom-wrapper xs12 sm12 md12>
        <img class="img" :src="urlzoom" :width="imagezoom_width" />
      </v-flex>
    </v-flex>
    <!--v-flex overload xs12 sm12 md12>
    </v-flex-->
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import {
  emitFormChangeEvent,
  FormChangeEvent,
  FormFieldDefMap,
  makeValidatorDictionary,
} from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import Confirmation from '@/components/Confirmation.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import ConfirmacionEliminar from '@/reusable/Mantenedor/ConfirmacionEliminar.vue';

import { AlertaGrilla } from '@/pantallas/Camaras/Alertas/fetchAlerta';
import { MnsajeNuevo } from '@/pantallas/CopilotoVirtual/Mensaje/mensaje';
import { fetchVariables } from '@/pantallas/CopilotoVirtual/Mensaje/fetchVariables';
import { OperacionesCrud } from '../../../reusable/Mantenedor/mantenedorUtils';
import MarkerClusterer, { ClusterIconStyle } from '@google/markerclustererplus';

@Component({
  components: {
    FormFieldsContainer,
    Confirmation,
    ConfirmacionEliminar,
  },
})
export default class AlertaCamaraForm extends Vue {
  @Prop({ default: false }) isVerDetalle: boolean;
  @Prop({ required: false }) alertaSeleccionado: AlertaGrilla;
  @Prop({ default: false }) esEditar: boolean;

  /* state */

  isFormValid: boolean = false;
  //vVariables: Variables[] = [];
  files: any[] = [];

  mostrarConfirmacionEliminar: boolean = false;
  mostrarDatos: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;

  icono: any = {};
  iconoUrl = '';
  iconoBase64: string = '';
  nombre: string = '';
  mensaje: string[] = ['* Ya existe un Mensaje con este nombre.'];
  hint: string = '';
  estado: boolean = true;
  seleccionEstado: number = 0;
  urlzoom: string = '';

  show_zoom: boolean = false;
  current_zoom: number = 1;
  min_zoom: number = 1;
  max_zoom: number = 5;
  imagezoom_width: string = '100%';

  modalCrudActivo: OperacionesCrud = null;

  map: google.maps.Map;
  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  formFields: FormFieldDefMap = {
    fechaAlarma: {
      label: 'fechaAlarma',
      id: 'fechaAlarma',
      value: '',
    },
    codVehiculo: {
      label: 'codVehiculo',
      id: 'codVehiculo',
      value: '',
    },
    codFlota: {
      label: 'codFlota',
      id: 'codFlota',
      value: '',
    },
    flota: {
      label: 'Flota',
      id: 'flota',
      value: '',
    },
    numActividad: {
      label: 'numActividad',
      id: 'numActividad',
      value: '',
    },
    alerta: {
      label: 'Alerta',
      id: 'alerta',
      value: '',
    },
    tipoAlerta: {
      label: 'Tipo Alerta',
      id: 'tipoAlerta',
      value: '',
    },
    patente: {
      label: 'Patente',
      id: 'patente',
      value: '',
    },
    velocidad: {
      label: 'Velocidad',
      id: 'velocidad',
      value: '',
    },
    latitud: {
      label: 'Latitud',
      id: 'latitud',
      value: '',
    },
    longitud: {
      label: 'Longitud',
      id: 'longitud',
      value: '',
    },
    files: {
      label: 'files',
      id: 'files',
      value: '',
    },
  };

  mounted() {
    const validator = makeValidatorDictionary(this.formFields);
    this.$validator.localize('es', validator);
    this.handleSeleccionadoChange();
  }

  handleCrearClick() {
    this.$validator.errors.clear();
    this.mostrarModalCrear = true;
  }
  handleCierraModalSinGuardar() {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
  }

  async handleCierreModalBtnGuardar(e: FormChangeEvent) {
    this.mostrarModalCrear = false;
  }
  async handleCierreModalBtnGuardarEditar(e: FormChangeEvent) {}

  cerrarModalCrud() {
    this.modalCrudActivo = null;
  }

  get isConfirmacionEliminarActivo() {
    return this.modalCrudActivo === OperacionesCrud.eliminar;
  }

  @Watch('alertaSeleccionado', { deep: true })
  async handleSeleccionadoChange() {
    if (!this.alertaSeleccionado) {
      return;
    }
    //this.formFields.alerta.value = this.alertaSeleccionado.alerta;
    this.formFields.patente.value = this.alertaSeleccionado.patente;
    this.formFields.tipoAlerta.value = this.alertaSeleccionado.tipoAlerta;

    let ubicacion = null;
    if (this.alertaSeleccionado.ubicacion.indexOf('null') == -1) {
      ubicacion = this.alertaSeleccionado.ubicacion.split(',');
      this.formFields.latitud.value = ubicacion[0];
      this.formFields.longitud.value = ubicacion[1];
    } else {
      this.formFields.latitud.value = 'Sin registro';
      this.formFields.longitud.value = 'Sin registro';
    }

    if (this.alertaSeleccionado.files != '') {
      this.files = JSON.parse(this.alertaSeleccionado.files);
    }

    if (ubicacion != null) {
      let lat1 = parseFloat(ubicacion[0]);
      let lon1 = parseFloat(ubicacion[1]);
      document.getElementById('mapContainer').innerHTML = '';
      this.map = new google.maps.Map(document.getElementById('mapContainer'), {
        center: { lat: lat1, lng: lon1 },
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        gestureHandling: 'greedy',
        mapTypeControl: false,
        maxZoom: 20,
        minZoom: 2,
        zoom: 12,
      });
      let iconourl =
        'http://www.clker.com/cliparts/v/G/a/3/i/a/map-marker-th.png';
      let icon = {
        url: iconourl,
        scaledSize: new google.maps.Size(32, 51),
      };
      var marker = new google.maps.Marker({
        map: this.map,
        position: { lat: lat1, lng: lon1 },
        icon: icon,
        //animation: google.maps.Animation.DROP
      });
    } else {
      document.getElementById('mapContainer').innerHTML = 'Sin ubicación';
    }
  }

  @Watch('$validator.errors.items.length')
  handleErrorsChange() {
    this.emitFormChange();
  }

  @Watch('formFields', { deep: true })
  handleFormChange() {
    this.emitFormChange();
  }

  emitFormChange() {
    emitFormChangeEvent(
      this.$emit.bind(this),
      {
        entity: {
          fechaAlarma: this.formFields.fechaAlarma.value,
          fechaIngreso: '',
          codVehiculo: this.formFields.codVehiculo.value,
          codFlota: null,
          flota: this.formFields.flota.value,
          patente: this.formFields.patente.value,
          numActividad: this.formFields.numActividad.value,
          velocidad: this.formFields.velocidad.value,
          tipoAlerta: this.formFields.tipoAlerta.value,
          tipoAlertaOriginal: '',
          evidencia: '',
          ubicacion:
            this.formFields.latitud.value +
            ',' +
            this.formFields.longitud.value,
          files: this.formFields.files.value,
          grupo: '',
        } as AlertaGrilla,
      },
      this
    );
  }

  fetchVariables() {
    this.loadingService.showLoading();
    return fetchVariables()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las variables',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }

  constructor() {
    super();
  }
  created() {
    this.cambio();
    this.files = [];
    if (this.alertaSeleccionado.files != '') {
      this.files = JSON.parse(this.alertaSeleccionado.files);
    }
  }

  cambio() {
    this.$emit('estadoSwitch', this.estado);
  }

  zoom(url: string) {
    this.urlzoom = url;
    this.show_zoom = true;
  }
  update_zoom() {
    if (this.current_zoom > this.max_zoom) {
      this.current_zoom = this.max_zoom;
    }
    if (this.current_zoom < this.min_zoom) {
      this.current_zoom = this.min_zoom;
    }
    this.imagezoom_width = 80 + 20 * this.current_zoom + '%';
  }
  zoom_in() {
    this.current_zoom = this.current_zoom + 1;
    this.update_zoom();
  }
  zoom_out() {
    this.current_zoom = this.current_zoom - 1;
    this.update_zoom();
  }
  zoom_close() {
    this.show_zoom = false;
    this.urlzoom = '';
  }
  download_img(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop();
    a.classList.add('urldownload');
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  handlerContexTmenu(e: any) {
    e.preventDefault();
  }
}
</script>
<style scoped>
.h2_title {
  font-weight: normal;
}
.icon {
  background-color: #ffe800 !important;
  color: black !important;
  margin-left: -10px !important;
  padding-right: 20px;
}
.overload {
  background: #000;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  opacity: 0.7;
}
.imagezoom {
  padding: 50px;
  background: #fff;
}
.imagezoom img {
}
.imagezoom-wrapper {
  max-width: 100%;
  max-height: 700px;
  overflow: scroll;
}
.icon {
  color: #526da5 !important;
}
.wrapper-files {
  background: #e8ebee;
}
.buttons-img {
}
.mapContainer {
  width: 100%;
  height: 510px;
  margin-bottom: 40px;
}
</style>
