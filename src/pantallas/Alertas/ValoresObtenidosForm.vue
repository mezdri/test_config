<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form
          ref="form"
          v-model="isFormValid"
          lazy-validation
          class="col-md-12"
        >
          <v-container grid-list-md style="padding: 30px 40px 50px 40px">
            <FormFieldsContainer titulo="Valores Obtenidos">
              <slot name="prependInformacionGeneral" />
              <v-flex xs6 sm6 md6>
                <DatePicker
                  :label="formFields.fecha.label"
                  :error-messages="errors.collect(formFields.fecha.id)"
                  :id="formFields.fecha.id"
                  v-model="formFields.fecha.value"
                  :disabled="true"
                />
              </v-flex>
              <v-flex xs6 sm6 md6>
                <v-text-field
                  type="time"
                  prepend-icon="access_time"
                  :label="formFields.hora.label"
                  :error-messages="errors.collect(formFields.hora.id)"
                  :data-vv-name="formFields.hora.id"
                  v-model="formFields.hora.value"
                  :disabled="true"
                />
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer v-show="muestraAlertaGenerica">
              <v-flex
                xs12
                sm6
                md6
                v-for="campo in lstCampos"
                v-bind:key="campo.id"
              >
                <v-text-field
                  :label="campo.descripcionCampo"
                  :error-messages="errors.collect(`${campo.id}`)"
                  :data-vv-name="campo.id"
                  v-bind:ref="campo.id"
                  v-model="campo.valor"
                  :disabled="true"
                />
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer
              v-show="
                muestraAlertaZona || muestraAlertaRuta || muestraAlertaVelocidad
              "
            >
              <v-flex xs12 sm6 md6>
                <DatePicker
                  :label="formFields.fechaActividadFinal.label"
                  :error-messages="
                    errors.collect(formFields.fechaActividadFinal.id)
                  "
                  :id="formFields.fechaActividadFinal.id"
                  v-model="formFields.fechaActividadFinal.value"
                  :disabled="true"
                />
              </v-flex>
              <v-flex xs12 sm6 md6>
                <v-text-field
                  prepend-icon="access_time"
                  :label="formFields.horaActividadFinal.label"
                  :error-messages="
                    errors.collect(formFields.horaActividadFinal.id)
                  "
                  :data-vv-name="formFields.horaActividadFinal.id"
                  v-model="formFields.horaActividadFinal.value"
                  :disabled="true"
                />
              </v-flex>
              <v-flex xs12 sm3 md3>
                <v-text-field
                  :label="formFields.velocidad.label"
                  :error-messages="errors.collect(formFields.velocidad.id)"
                  :data-vv-name="formFields.velocidad.id"
                  v-model="formFields.velocidad.value"
                  :disabled="true"
                />
              </v-flex>
              <v-flex xs12 sm3 md3>
                <v-text-field
                  :label="formFields.ubicacion.label"
                  :error-messages="errors.collect(formFields.ubicacion.id)"
                  :data-vv-name="formFields.ubicacion.id"
                  v-model="formFields.ubicacion.value"
                  :disabled="true"
                />
              </v-flex>
              <v-flex xs12 sm3 md3>
                <v-text-field
                  :label="formFields.heading.label"
                  :error-messages="errors.collect(formFields.heading.id)"
                  :data-vv-name="formFields.heading.id"
                  v-model="formFields.heading.value"
                  :disabled="true"
                />
              </v-flex>
              <v-flex xs12 sm3 md3>
                <v-text-field
                  :label="formFields.peakVelocidad.label"
                  :error-messages="errors.collect(formFields.peakVelocidad.id)"
                  :data-vv-name="formFields.peakVelocidad.id"
                  v-model="formFields.peakVelocidad.value"
                  :disabled="true"
                />
              </v-flex>
              <v-flex xs12 sm3 md3>
                <v-text-field
                  :label="formFields.conductor.label"
                  :error-messages="errors.collect(formFields.conductor.id)"
                  :data-vv-name="formFields.conductor.id"
                  v-model="formFields.conductor.value"
                  :disabled="true"
                />
              </v-flex>
              <v-flex xs12 sm3 md3>
                <v-text-field
                  :label="formFields.flota.label"
                  :error-messages="errors.collect(formFields.flota.id)"
                  :data-vv-name="formFields.flota.id"
                  v-model="formFields.flota.value"
                  :disabled="true"
                />
              </v-flex>
              <v-flex xs12 sm3 md3>
                <v-text-field
                  :label="formFields.minutos.label"
                  :error-messages="errors.collect(formFields.minutos.id)"
                  :data-vv-name="formFields.minutos.id"
                  v-model="formFields.minutos.value"
                  :disabled="true"
                />
              </v-flex>
              <v-flex xs12 sm3 md3 v-if="!muestraAlertaVelocidad">
                <v-text-field
                  :label="formFields.zona.label"
                  :error-messages="errors.collect(formFields.zona.id)"
                  :data-vv-name="formFields.zona.id"
                  v-model="formFields.zona.value"
                  :disabled="true"
                />
              </v-flex>
              <v-flex xs12 sm3 md3>
                <v-text-field
                  :label="formFields.kilometrosAcumulados.label"
                  :error-messages="
                    errors.collect(formFields.kilometrosAcumulados.id)
                  "
                  :data-vv-name="formFields.kilometrosAcumulados.id"
                  v-model="formFields.kilometrosAcumulados.value"
                  :disabled="true"
                />
              </v-flex>
              <v-flex xs12 sm3 md3>
                <v-text-field
                  :label="formFields.horometroAcumulado.label"
                  :error-messages="
                    errors.collect(formFields.horometroAcumulado.id)
                  "
                  :data-vv-name="formFields.horometroAcumulado.id"
                  v-model="formFields.horometroAcumulado.value"
                  :disabled="true"
                />
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer v-show="muestraAlertaUsoNoAutorizado">
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.tolerancia.label"
                  :error-messages="errors.collect(formFields.tolerancia.id)"
                  :data-vv-name="formFields.tolerancia.id"
                  v-model="formFields.tolerancia.value"
                  :disabled="true"
                />
              </v-flex>
            </FormFieldsContainer>
            <FormFieldsContainer v-show="muestraAlertaDetencionNoAutorizada">
              <v-flex xs12 sm6 md6>
                <v-text-field
                  :label="formFields.velocidadIgnicion.label"
                  v-validate="'numeric'"
                  :error-messages="
                    errors.collect(formFields.velocidadIgnicion.id)
                  "
                  :data-vv-name="formFields.velocidadIgnicion.id"
                  v-model="formFields.velocidadIgnicion.value"
                  :disabled="true"
                />
              </v-flex>
            </FormFieldsContainer>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, TipoAlertaBase } from '@/config/enums';
import config from '@/config/index';
import { Validator } from 'vee-validate';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';

import { CampoDinamico, AlertaVehiculo } from '@/interfaces/Alertas';

import {
  typeNuevosCampo,
  AlertasBaseBackend,
} from '@/pantallas/ConfigurarBase/ConfiguracionBase';

@Component({
  components: {
    FormFieldsContainer,
    DatePicker,
  },
})
export default class ValoresObtenidosForm extends Vue {
  @Prop({ required: true }) lstAlertasBase: AlertasBaseBackend[];
  @Prop({ required: true }) alertaVehiculo: AlertaVehiculo;

  isFormValid: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Alerta);
  readonly $snotify: Snotify;
  loadingService = new LoadingService();

  lstCampos: typeNuevosCampo[] = [];
  tipoBase: number = -1;

  muestraAlertaGenerica: boolean = false;
  muestraAlertaZona: boolean = false;
  muestraAlertaRuta: boolean = false;
  muestraAlertaVelocidad: boolean = false;
  muestraAlertaUsoNoAutorizado: boolean = false;
  muestraAlertaDetencionNoAutorizada: boolean = false;

  formFields: FormFieldDefMap = {
    fecha: {
      label: 'Fecha Alerta',
      id: 'fecha',
      value: null,
    },
    hora: {
      label: 'Hora Alerta',
      id: 'hora',
      value: null,
    },
    velocidad: {
      label: 'Velocidad en km/h',
      id: 'velocidad',
      value: '',
    },
    tolerancia: {
      label: 'Tolerancia en km/h',
      id: 'tolerancia',
      value: '',
    },
    velocidadIgnicion: {
      label: 'Velocidad en km/h',
      id: 'velocidadIgnicion',
      value: '',
    },
    ubicacion: {
      label: 'Ubicación',
      id: 'ubicacion',
      value: '',
    },
    heading: {
      label: 'Heading (Dirección)',
      id: 'heading',
      value: '',
    },
    peakVelocidad: {
      label: 'Peak de Velocidad',
      id: 'peakVelocidad',
      value: '',
    },
    conductor: {
      label: 'Conductor',
      id: 'conductor',
      value: '',
    },
    flota: {
      label: 'Flota',
      id: 'flota',
      value: '',
    },
    minutos: {
      label: 'Minutos',
      id: 'minutos',
      value: '',
    },
    zona: {
      label: 'Zona',
      id: 'zona',
      value: '',
    },
    fechaActividadFinal: {
      label: 'Fecha Actividad Final',
      id: 'fechaActividadFinal',
      value: null,
    },
    kilometrosAcumulados: {
      label: 'Kilometros Acumulados',
      id: 'kilometrosAcumulados',
      value: '',
    },
    horometroAcumulado: {
      label: 'Horometro Acumulado',
      id: 'horometroAcumulado',
      value: '',
    },
    horaActividadFinal: {
      label: 'Hora Actividad Final',
      id: 'horaActiFinal',
      value: null,
    },
  };

  mounted() {
    this.handleAlertaSeleccionadaChange();
  }

  @Watch('alertaVehiculo', { deep: true })
  handleAlertaSeleccionadaChange() {
    const av = this.alertaVehiculo;
    if (av) {
      this.formFields.fecha.value = av.fechaCreacion;
      this.formFields.hora.value = av.fechaCreacion.format('HH:mm:ss');

      this.handlerChangeTipo(av.alertaBaseId);

      if (this.tipoBase == TipoAlertaBase.AlertaZona || this.tipoBase == TipoAlertaBase.AlertaRuta) {
        this.formFields.velocidad.value = av.velocidadActual;
        this.formFields.ubicacion.value = av.actividad.ubicacion;
        this.formFields.heading.value = av.actividad.heading;
        this.formFields.peakVelocidad.value = av.velocidadMaxima;
        this.formFields.kilometrosAcumulados.value = av.kmAcumulados;
        this.formFields.conductor.value = av.conductor ? av.conductor.nombre : '';
        this.formFields.zona.value = av.zona;
        this.formFields.flota.value = av.flota;
        this.formFields.fechaActividadFinal.value = av.fechaActFin;
        this.formFields.horometroAcumulado.value = av.horometro;
        this.formFields.minutos.value = av.minutos;
        this.formFields.horaActividadFinal.value = av.fechaActFin.format('HH:mm:ss');
      }
    }
  }

  handlerChangeTipo(value: number) {
    this.resetTipoAlerta();
    var alertaBase: AlertasBaseBackend = this.lstAlertasBase.find(
      ab => ab.id == value
    );
    this.tipoBase = alertaBase.baseTipo;

    switch (this.tipoBase) {
      /*case TipoAlertaBase.AlertaGenerica:
        this.mostrarAlertaGenerica(value);
        break;*/
      case TipoAlertaBase.AlertaZona:
        this.muestraAlertaZona = true;
        break;
      case TipoAlertaBase.AlertaRuta:
        this.muestraAlertaRuta = true;
        break;
      case TipoAlertaBase.AlertaUsoNoAutorizado:
        this.muestraAlertaUsoNoAutorizado = true;
        break;
      case TipoAlertaBase.AlertaDetencionNoAutorizada:
        this.muestraAlertaDetencionNoAutorizada = true;
        break;
    }

    if (value === 54) {
      this.muestraAlertaVelocidad = true;
      this.tipoBase = TipoAlertaBase.AlertaZona;
    }
  }

  resetTipoAlerta() {
    this.lstCampos = [];
    this.muestraAlertaGenerica = false;
    this.muestraAlertaZona = false;
    this.muestraAlertaVelocidad = false;
    this.muestraAlertaRuta = false;
    this.muestraAlertaUsoNoAutorizado = false;
    this.muestraAlertaDetencionNoAutorizada = false;
  }

  /* Alerta generica */

  /*mostrarAlertaGenerica(value: number) {
    this.loadingService.showLoading();
    this.axios.http
      .get('Alerta/' + value + '/GetParamAlertaBase')
      .then(res => {
        if (res !== null && res !== undefined) {
          this.lstCampos = res.data;

          if (this.alertaSeleccionada) {
            this.alertaSeleccionada.campoDinamico.forEach(cd => {
              this.lstCampos.forEach(c => {
                if (cd.alertaCampoDinamicoId == c.id) {
                  c.valor = cd.valorCampoDinamico;
                }
              });
            });
          }

          this.muestraAlertaGenerica = true;
        }
      })
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener los campos.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener los campos.');
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }*/
}
</script>
