<template>
  <v-dialog
    v-model="dialog"
    persistent
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card id="cardDivTL">
      <v-toolbar dark color="primary" fixed>
        <v-btn
          icon
          dark
          @click="dialogConfirmacionClose = true"
          :disabled="btnBloquear"
        >
          <v-icon>close</v-icon>
        </v-btn>

        <v-toolbar-title>Crear Configuración Landing</v-toolbar-title>

        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            class="btn-grabar"
            @click="continuar()"
            :disabled="!validForm || btnBloquear"
            >{{ btnText }}</v-btn
          >
        </v-toolbar-items>
      </v-toolbar>
      <br />
      <br />
      <br />
      <v-stepper v-model="e1">
        <v-stepper-header>
          <v-stepper-step
            v-show="informacionGeneral.visible"
            :complete="e1 > informacionGeneral.step"
            :step="informacionGeneral.step"
            >Información General</v-stepper-step
          >
        </v-stepper-header>
        <v-stepper-items class="cardnew">
          <v-stepper-content
            v-show="informacionGeneral.visible"
            :step="informacionGeneral.step"
          >
            <div align="center">
              <v-flex md10>
                <v-card class="rounded-card">
                  <v-form
                    ref="form"
                    v-model="validForm"
                    lazy-validation
                    class="col-md-12"
                  >
                    <v-container grid-list-md>
                      <div align="left">
                        <h2
                          class="h2_title"
                          style="margin-top: 12px!important; font-weight: normal"
                        >
                          Información General
                        </h2>
                        <v-divider></v-divider>
                      </div>
                      <br />
                      <v-layout wrap>
                        <v-flex xs12 sm12 md12>
                          <v-select
                            :items="tipos"
                            v-model="tipoSeleccionado"
                            label="
                                Tipo Configuración"
                            required
                            no-data-text="Sin resultados"
                          ></v-select>
                        </v-flex>
                      </v-layout>
                      <v-layout>
                        <v-flex md3>
                          <DatePicker
                            label="Desde"
                            :error-messages="
                              errors.collect(formFields.fechaDesde.id)
                            "
                            :id="formFields.fechaDesde.id"
                            v-model="formFields.fechaDesde.value"
                            :min="fechaMinima"
                            :max="fechaMaxima"
                          />
                        </v-flex>

                        <v-flex md3>
                          <TimePicker
                            v-model="formFields.horaInicio.value"
                            :label="formFields.horaInicio.label"
                            :error-messages="
                              errors.collect(formFields.horaInicio.id)
                            "
                            :id="formFields.horaInicio.id"
                          />
                        </v-flex>

                        <v-flex md3>
                          <DatePicker
                            label="Hasta"
                            :error-messages="
                              errors.collect(formFields.fechaHasta.id)
                            "
                            :id="formFields.fechaHasta.id"
                            v-model="formFields.fechaHasta.value"
                            :min="fechaMaxima"
                          />
                        </v-flex>

                        <v-flex md3>
                          <TimePicker
                            v-model="formFields.horaHasta.value"
                            :label="formFields.horaHasta.label"
                            :error-messages="
                              errors.collect(formFields.horaHasta.id)
                            "
                            :id="formFields.horaHasta.id"
                          />
                        </v-flex>
                      </v-layout>
                      <v-layout v-if="tipoSeleccionado == 'Banner'">
                        <v-flex xs12 sm12 md12>
                          <v-text-field
                            label="Seleccione Archivo"
                            heigh
                            @click="$refs.image.click()"
                            prepend-icon="attach_file"
                            v-model="fileName"
                            v-validate="'required|extension|tamanio'"
                            :error-messages="errors.collect('archivo')"
                            data-vv-name="archivo"
                            readonly="readonly"
                          ></v-text-field>
                          <input
                            type="file"
                            style="display: none;"
                            ref="image"
                            accept="image/*"
                            @change="previewImage"
                            :key="idkey"
                          />
                        </v-flex>
                      </v-layout>
                      <v-layout v-else-if="tipoSeleccionado == 'Mensaje'">
                        <v-flex md12 xl12 xs12>
                          <v-text-field
                            md12
                            xl12
                            xs12
                            label="Titulo"
                            class="text-detencion"
                            v-model="TituloMensaje"
                          >
                          </v-text-field>
                        </v-flex>
                        <v-flex md12 xl12 xs12>
                          <v-text-field
                            label="Contenido"
                            class="text-detencion"
                            v-model="ContenidoMensaje"
                          >
                          </v-text-field>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-form>
                </v-card>
              </v-flex>
            </div>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.crud.crear.titulo', { entidad: 'Configuración' })"
      :mensaje="
        $t('mensajes.crud.crear.mensaje', { entidad: 'la Configuración' })
      "
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></app-confirmacion>
    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    ></app-confirmacion>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEntidad } from '@/config/enums';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
const { AgGridVue } = require('ag-grid-vue');
import { Validator } from 'vee-validate';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import ValidaRut from '@/config/validaRut';
import { Contacto } from '@/pantallas/Contactos/Contacto';
import { ITipoContacto } from '../../interfaces/TipoContacto';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import { differenceBy } from 'lodash';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
} from 'ag-grid-community';
import { ListaDistribucion } from '../../pantallas/ListaDistribucion/ListaDistribucion';
import moment from 'moment';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import TimePicker from '@/reusable/Form/TimePicker.vue';
import store from '@/store';
import { fetchDashboard } from '../Dashboard/fetchDashboard';

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
    DatePicker,
    TimePicker,
  },
})
export default class ConfigurarLandingModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.Contactos;
  permisosActuales: PermisoAccionVm[] = [];
  TituloMensaje: string = '';
  ContenidoMensaje: string = '';
  usuarioId: number = store.state.userId;

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  asociarLista: PermisoAccionVm = {
    accion: 'Crear - Asociar Lista de Distribución',
    visible: true,
    step: 2,
    codigoSubAccion: 58,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarLista,
  ];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Guardar';
  btnClass: string = 'btn-grabar';
  dialog: boolean = false;
  validForm: boolean = false;
  dictionaryFormErrors: any = {};
  dialogConfirmacion: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  dialogConfirmacionClose: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Contacto);
  loadingService = new LoadingService();
  btnBloquear: boolean = false;
  fileName: string = '';
  tipos: string[] = ['Mensaje', 'Banner'];
  tipoSeleccionado: string = null;
  image: any = null;
  preview: any = null;

  //controllers
  idkey: number = 0;
  //Data

  //Grilla
  formFields: any = {
    fechaDesde: {
      label: 'Desde',
      id: 'fechaDesde',
      value: moment(this.fechaDesde),
    },
    fechaHasta: {
      label: 'Hasta',
      id: 'fechaHasta',
      value: moment(this.fechaMaxima),
    },
    horaInicio: {
      label: 'Hora Desde',
      id: 'horaInicio',
      value: moment('00:00', 'HHmm'),
    },
    horaHasta: {
      label: 'Hora Hasta',
      id: 'horaHasta',
      value: moment('23:59', 'HHmm'),
    },
  };

  constructor() {
    super();
  }

  created() {
    this.chequearPermisos();
  }

  mounted() {
    this.initialize();
  }

  onFilePicked(e: any) {
    let self = this;
    var tgt = e.target || window.event.srcElement,
      files = tgt.files;
    this.fileName = files[0].name;

    this.idkey += 1;
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Guardar';
    this.btnClass = 'btn-grabar';
    this.$validator.reset();
    if (value) {
      //this.loadingService.showLoading();
    }
  }

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
  get fechaDesde() {
    let fechaDesde = moment(new Date())
      .add(-1, 'days')
      .toISOString()
      .substr(0, 10);
    return fechaDesde;
  }

  continuar() {
    this.$validator.validateAll().then(resultado => {
      if (resultado) {
        this.btnBloquear = true;
        this.dialogConfirmacion = true;
      }
    });
  }

  closeModal(val: boolean) {
    this.$emit('modalAsociacionEmit', false);
    this.TituloMensaje = '';
    this.ContenidoMensaje = '';
    this.tipoSeleccionado = null;
    this.dialog = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (val) {
      if (this.tipoSeleccionado == 'Banner') {
        var modelBanner = {
          type: 'banner',
          //url: this.url,
          startDate: this.formFields.fechaDesde.value,
          finishDate: this.formFields.fechaHasta.value,
          updateUser: this.usuarioId,
        };
        await fetchDashboard(modelBanner, 'pantalla/add_pantalla').then(
          (x: any) => {
            this.$snotify.success(
              this.$t('mensajes.mensajesExito.crear', {
                entidad: 'Configuración',
                creadoA: 'creada',
              })
            );
            this.closeModal(true);
          }
        );
      } else {
        var modelMensaje = {
          type: 'mensaje',
          title: this.TituloMensaje,
          message: this.ContenidoMensaje,
          startDate: this.formFields.fechaDesde.value,
          finishDate: this.formFields.fechaHasta.value,
          updateUser: this.usuarioId,
        };
        await fetchDashboard(modelMensaje, 'pantalla/add_pantalla').then(
          (x: any) => {
            this.$snotify.success(
              this.$t('mensajes.mensajesExito.crear', {
                entidad: 'Configuración',
                creadoA: 'creada',
              })
            );
            this.closeModal(true);
          }
        );
      }
    }
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        'correo electrónico': {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        rut: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        nombre: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        tipoContacto: {
          required: () => config.errorMensajes.textoRequerido,
        },
        'Teléfono Contacto': {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
        empresa: {
          required: () => config.errorMensajes.textoRequerido,
          max: () => config.errorMensajes.maxLength,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  getRowNodeId(lista: any) {
    if (!lista) {
      return;
    }
    return lista.id;
  }

  cierraMenu() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }

  previewImage(event: any) {
    var input = event.target;
    if (input.files) {
      var reader = new FileReader();
      reader.onload = e => {
        this.preview = e.target.result;
      };
      this.image = input.files[0];
      reader.readAsDataURL(input.files[0]);
    }
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>
