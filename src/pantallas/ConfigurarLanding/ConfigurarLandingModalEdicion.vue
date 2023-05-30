<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivRT">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="
              !esEdicion ? closeModal(false) : (dialogConfirmacionClose = true)
            "
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{
            esEdicion ? 'Editar Configuración' : 'Ver Detalle Configuración'
          }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              @click="grabarEdicion(), (btnBloquear = true)"
              :disabled="!validForm || btnBloquear"
              >Guardar Cambios</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />
        <div>
          <v-card height="55px" flat>
            <v-bottom-nav
              :active.sync="bottomNav"
              :value="true"
              absolute
              color="transparent"
            >
              <v-btn
                @click="cierraMenu"
                color="primary"
                flat
                v-show="
                  (informacionGeneral.visible && esEdicion) ||
                    (informacionGeneralVerDetalle.visible && !esEdicion)
                "
                :value="informacionGeneral.step"
              >
                <span>Información General</span>
                <v-icon>info</v-icon>
              </v-btn>
            </v-bottom-nav>
          </v-card>
          <div
            align="center"
            v-show="
              bottomNav == informacionGeneral.step &&
                ((informacionGeneral.visible && esEdicion) ||
                  (informacionGeneralVerDetalle.visible && !esEdicion))
            "
            class="cardnew"
          >
            <br />
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
                      <v-flex md12>
                        <h2
                          class="h2_title"
                          style="margin-top: 12px!important;"
                        >
                          Informaci&oacute;n General
                        </h2>
                      </v-flex>
                    </div>
                    <v-divider></v-divider>
                    <br />
                    <v-layout wrap>
                      <v-text-field
                        label="Código"
                        v-model="configuracion.id"
                        readonly
                        disabled
                      ></v-text-field>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-model="configuracion.tipo"
                          disabled
                          readonly
                          label="
                                Tipo Configuración"
                          required
                          no-data-text="Sin resultados"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout>
                      <v-flex md3>
                        <DatePicker
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
                          :error-messages="
                            errors.collect(formFields.fechaHasta.id)
                          "
                          :id="formFields.fechaHasta.id"
                          v-model="formFields.fechaHasta.value"
                          :min="fechaMinima"
                          :max="fechaMaxima"
                        />
                      </v-flex>

                      <v-flex md3>
                        <TimePicker
                          :disabled="!esEdicion"
                          v-model="formFields.horaHasta.value"
                          :label="formFields.horaHasta.label"
                          :error-messages="
                            errors.collect(formFields.horaHasta.id)
                          "
                          :id="formFields.horaHasta.id"
                        />
                      </v-flex>
                    </v-layout>
                    <v-layout v-if="configuracion.tipo == 'banner'">
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          label="Seleccione Archivo"
                          heigh
                          :disabled="!esEdicion"
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
                          :disabled="!esEdicion"
                          style="display: none;"
                          ref="image"
                          accept="image/*"
                          @change="previewImage"
                          :key="idkey"
                        />
                      </v-flex>
                    </v-layout>
                    <v-layout v-else-if="configuracion.tipo == 'mensaje'">
                      <v-flex md12 xl12 xs12>
                        <v-text-field
                          md12
                          xl12
                          xs12
                          label="Titulo"
                          class="text-detencion"
                          v-model="configuracion.titulo"
                          :disabled="!esEdicion"
                        >
                        </v-text-field>
                      </v-flex>
                      <v-flex md12 xl12 xs12>
                        <v-text-field
                          label="Contenido"
                          class="text-detencion"
                          v-model="configuracion.mensaje"
                          :disabled="!esEdicion"
                        >
                        </v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-form>
              </v-card>
            </v-flex>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="'Editar Configuración'"
      :mensaje="
        $t('mensajes.crud.editar.mensaje', { entidad: 'Configuración' })
      "
      v-on:modalConfirmationEmit="confirmCallback($event, false)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="'Editar Configuración'"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, true)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoEntidad } from '@/config/enums';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { differenceBy } from 'lodash';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
} from 'ag-grid-community';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { EstadosService } from '@/services/estadosService';
import { EstadoInterface } from '@/interfaces/Estado';
import { ListaDistribucion } from '../../pantallas/ListaDistribucion/ListaDistribucion';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard'; // contiene la ruta base
import moment from 'moment';
import TimePicker from '../../reusable/Form/TimePicker.vue';
import DatePicker from '../../reusable/Form/DatePicker.vue';

const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
    TimePicker,
    DatePicker,
  },
})
export default class ConfigurarLandingModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ default: () => ({ id: 0 }) }) configuracion!: any;

  //permisos
  funcionalidad: Funcionalidades = Funcionalidades.SIM;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.informacionGeneralVerDetalle,
  ];

  //controller

  $snotify: any;
  btnText: string = 'Continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: any = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  btnBloquear: boolean = false;
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  tipos: string[] = ['Mensaje', 'Banner'];
  tipoSeleccionado: string = null;
  image: any = null;
  preview: any = null;
  fileName: string = '';
  idkey: number = 0;
  TituloMensaje: string = '';
  ContenidoMensaje: string = '';

  //Data
  mensajeConfirmacionInactivo: any = '';
  estado: boolean = true;
  sideBar: any = config.agGridDefaultConfig;

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
  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.bottomNav = '1';
    this.$validator.reset();

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      this.loadingService.showLoading();
      this.editedItem = this.configuracion;
      this.estado = this.editedItem.estado === 1 ? true : false;
      this.initialize();
      this.btnBloquear = false;
      this.editedItem.listaDistribucionId;
      this.loadingService.hideLoading();
    }
  }

  setBotonNav() {
    var accion = 'Editar';
    var evaluado = false;

    if (!this.esEdicion) {
      accion = 'Ver Detalle';
    }
    this.permisosTotales.forEach(obj => {
      if (obj.visible && obj.accion.includes(accion) && !evaluado) {
        this.bottomNav = obj.step;
        evaluado = true;
      }
    });
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

  grabarEdicion() {
    this.$validator.validateAll().then(res => {
      if (res) {
        this.dialogConfirmacion = true;
        this.btnBloquear = false;
      }
    });
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;

    if (val) {
      this.loadingService.showLoading();
      try {
        this.editedItem.estado = 1;
        let model = {
          //type=mensaje&id=123&title=test&message=test&startDate=2022-05-06&finishDate=2022-05-06&updateUser=3
          type: this.configuracion.tipo,
          id: this.configuracion.id,
          message: this.configuracion.mensaje,
          title: this.configuracion.titulo,
          startDate: this.configuracion.fechainicio,
        };
        await fetchDashboard(model, 'pantalla/update_pantalla')
          .then(async (r: any) => {
            if (r.data.CODIGO_RESPUESTA == 1) {
              this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
            } else {
              this.$snotify.error(
                'Ha ocurrido un error al intentar actualizar la configuración'
              );
            }
          })
          .finally(() => {
            this.loadingService.hideLoading();
            this.closeModal(true);
          });

        this.btnBloquear = false;
      } catch (e) {
        console.log(e);
      }
    }
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  cierraMenu() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.estado = true;
  }

  initialize() {
    this.dictionaryFormErrors = {
      custom: {
        cia: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        numSim: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          numeric: config.errorMensajes.soloNumeros,
        },
        tipoSim: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        numeroTelefonico: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          regex: config.errorMensajes.regex,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);

    if (!this.esEdicion) {
    }
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
    }
  }

  getRowNodeId(lista: any) {
    if (!lista) {
      return;
    }
    return lista.id;
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>
