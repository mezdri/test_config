<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivLista">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Crear Solicitud de Baja</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              @click="crear()"
              class="icon"
              style="background-color: rgb(255, 108, 0); 
              border-color: rgb(255, 108, 0); 
              padding-right: 20px; 
              display: block;
              margin: 0 0 0 auto; 
              max-height: 75% !important;"
            >
              <span style="color: white;" class="color-blanco">Guardar</span>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />
        <div align="center">
          <v-flex md10>
            <v-card class="rounded-card">
              <v-form ref="form" lazy-validation class="col-md-12">
                <v-container grid-list-md style="padding: 30px 40px 50px 40px;">
                  <FormFieldsContainer titulo="Información General">
                    <slot name="prependInformacionGeneral" />
                    <v-flex x4 sm4 md4>
                      <v-text-field
                        v-model="formFields.numero.value"
                        :label="formFields.numero.label"
                        :disabled="modoVer"
                      />
                    </v-flex>
                    <v-flex xs4 sm4 md4>
                      <v-text-field
                        v-model="formFields.fecha.value"
                        :label="formFields.fecha.label"
                        :disabled="modoVer"
                      />
                    </v-flex>
                    <v-flex xs4 sm4 md4>
                      <v-text-field
                        v-model="formFields.usuario.value"
                        :label="formFields.usuario.label"
                        :disabled="modoVer"
                      />
                    </v-flex>
                    <v-flex xs4 sm4 md4>
                      <v-text-field
                        v-model="formFields.simserienumero.value"
                        :label="formFields.simserienumero.label"
                        @change="mostrarserie"
                      />
                    </v-flex>
                    <v-flex xs4 sm4 md4>
                      <v-text-field
                        v-model="formFields.estadoalta.value"
                        :label="formFields.estadoalta.label"
                        :disabled="modoVer"
                      />
                    </v-flex>
                    <v-flex xs4 sm4 md4>
                      <v-text-field
                        v-model="formFields.estadoactual.value"
                        :label="formFields.estadoactual.label"
                        :disabled="modoVer"
                      />
                    </v-flex>
                    <v-flex xs4 sm4 md4>
                      <v-text-field
                        v-model="formFields.telco.value"
                        :label="formFields.telco.label"
                        :disabled="modoVer"
                      />
                    </v-flex>
                    <v-flex xs4 sm4 md4>
                      <v-text-field
                        v-model="formFields.telcoplan.value"
                        :label="formFields.telcoplan.label"
                        :disabled="modoVer"
                      />
                    </v-flex>
                    <v-flex xs4 sm4 md4>
                      <v-autocomplete
                        v-model="formFields.motibaja.value"
                        :label="formFields.motibaja.label"
                        :items="bajalist"
                        item-text="motiname"
                        item-value="motiid"
                        clearable
                      />
                    </v-flex>
                    <v-flex xs4 sm4 md4>
                      <v-text-field
                        v-model="formFields.observacion.value"
                        :label="formFields.observacion.label"
                      />
                    </v-flex>
                  </FormFieldsContainer>
                </v-container>
              </v-form>
            </v-card>
          </v-flex>
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.crear.titulo', { entidad: 'La solicitud de baja' })
      "
      :mensaje="mensajeConfirmacionInactivo"
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
  </v-layout>
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

import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import moment from 'moment';
import { fetchReportesSerie } from './fetchReporteSerie';
@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
    FormFieldsContainer,
  },
})
export default class CrearSolicitud extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: null }) serverSide: any;

  //abstract
  funcionalidad: Funcionalidades = Funcionalidades.SimBajaIndividual;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Crear,
  };

  permisosTotales: PermisoAccionVm[] = [this.informacionGeneral];

  //Variables globales

  configid: any = '';
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: Contacto = {};
  dictionaryFormErrors: any = {};
  dialogConfirmacion: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  dialogConfirmacionClose: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Contacto);
  clienteId: number = config.getClienteSesion();
  loadingService = new LoadingService();
  btnBloquear: boolean = false;
  vr: ValidaRut = new ValidaRut();
  bajalist: any[] = [];

  //controllers
  readonly Controller: string = 'Contactos';

  //Data
  tiposContacto: ITipoContacto[] = [];
  warningInactivo: any = '';
  guardarInactivo: boolean = false;
  mensajeConfirmacionInactivo: any = '';
  estado: boolean = true;

  //Grilla
  buscarListaDistribucion: string = '';
  columnDefs: Array<ColDef> = [];

  sideBar: any = config.agGridDefaultConfig;
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;

  async getEquipos2() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie({ '': '' }, 'sim_baja_individual/get_motibaja')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.bajalist = data.data.BAJAS;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  formFields: FormFieldDefMap = {
    numero: {
      label: 'Número',
      id: '',
      value: '',
    },
    fecha: {
      label: 'Fecha de Solicitud',
      id: '',
      value: moment().format('YYYY-MM-DD h:mm:ss'),
    },
    usuario: {
      label: 'Usuario',
      id: '',
      value: '',
    },
    simserienumero: {
      label: 'SIM Serie Número',
      id: '',
      value: '',
    },
    estadoalta: {
      label: 'Estado al Alta',
      id: '',
      value: '',
    },
    estadoactual: {
      label: 'Estado Actual',
      id: '',
      value: '',
    },
    telco: {
      label: 'Telco',
      id: '',
      value: '',
    },
    telcoplan: {
      label: 'Telco Plan',
      id: '',
      value: '',
    },
    motibaja: {
      label: 'Motivo de Baja',
      id: '',
      value: '',
    },
    observacion: {
      label: 'Observación',
      id: '',
      value: '',
    },
  };

  created() {
    this.chequearPermisos();
  }

  mounted() {
    this.getEquipos2();
    this.getEquipos();
  }

  crear() {
    this.dialogConfirmacion = true;
  }
  async mostrarserie() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { serienumero: this.formFields.simserienumero.value },
      'sim_baja_individual/tomar_sim'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.formFields.estadoalta.value = data.data.SIM[0].configvalor;
          this.formFields.estadoactual.value = data.data.SIM[0].configvalor;
          this.formFields.telco.value = data.data.SIM[0].telconame;
          this.formFields.telcoplan.value = data.data.SIM[0].telcoplanname;
          this.configid = data.data.SIM[0].configid;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.formFields.estadoalta.value = '(Sin datos)';
          this.formFields.estadoactual.value = '(Sin datos)';
          this.formFields.telco.value = '(Sin datos)';
          this.formFields.telcoplan.value = '(Sin datos)';
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }
  async getEquipos() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { usuarioid: JSON.parse(localStorage.getItem('user')).id },
      'sim_baja_individual/carga_crear'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.formFields.numero.value =
            Number(data.data.data.ult_sbajasimnumero) + 1;
          this.formFields.usuario.value = data.data.data2.nombre;
          this.formFields.observacion.value = '';
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    this.$validator.reset();
    if (value) {
      this.loadingService.showLoading();
      this.editedItem.estado = EstadoEntidad.Activo;
      this.loadingService.hideLoading();
    }
    this.mensajeConfirmacionInactivo = this.$t('mensajes.crud.crear.mensaje', {
      entidad: 'La baja de la SIM',
    });
  }

  closeModal(val: boolean) {
    this.$emit('modalAsociacionEmit', false);
    this.$validator.reset();
    this.formFields.simserienumero.value = '';
    this.formFields.observacion.value = '';
    this.formFields.estadoalta.value = '(Sin datos)';
    this.formFields.estadoactual.value = '(Sin datos)';
    this.formFields.telco.value = '(Sin datos)';
    this.formFields.telcoplan.value = '(Sin datos)';
    this.formFields.motibaja.value = '';
    this.dialog = false;
  }

  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (
      this.formFields.simserienumero.value === '' ||
      this.formFields.estadoalta.value === '(Sin datos)'
    ) {
      this.loadingService.hideLoading();
      this.$snotify.error('Falta la SIM Serie Número');
      return;
    }
    let self = this;
    if (val) {
      this.loadingService.showLoading();
      return fetchReportesSerie(
        {
          numero: this.formFields.numero.value,
          usuarioid: JSON.parse(localStorage.getItem('user')).id,
          usuariorut: JSON.parse(localStorage.getItem('user'))
            .rutClienteDefecto,
          estado: this.configid,
          observacion: this.formFields.observacion.value,
          serienumero: this.formFields.simserienumero.value,
          motiid: this.formFields.motibaja.value,
        },
        'sim_baja_individual/solicitar_baja'
      )
        .then((data: any) => {
          if (data.data.MENSAJE_RESPUESTA == 'Estado Creado OK') {
            self.$snotify.success(
              'Ha solicitado con éxtito la baja de la SIM Número ' +
                this.formFields.simserienumero.value,
              { timeout: 3000 }
            );
            this.formFields.simserienumero.value = '';
            this.formFields.observacion.value = '';
            this.formFields.estadoalta.value = '(Sin datos)';
            this.formFields.estadoactual.value = '(Sin datos)';
            this.formFields.telco.value = '(Sin datos)';
            this.formFields.telcoplan.value = '(Sin datos)';
            this.formFields.motibaja.value = '';
            this.closeModal(false);
            this.getEquipos();
            this.getEquipos2();
          } else {
            console.log(data);
            self.$snotify.error(
              'La SIM presenta una solicitud de Baja Vigente',
              { timeout: 3000 }
            );
            return;
          }
        })
        .catch((error: any) => {
          return;
        })
        .finally(() => {
          this.loadingService.hideLoading();

          return null;
        });
    }
  }
  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
      this.getEquipos();
      this.getEquipos2();
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

  onFilterTextBoxChangedLista() {
    if (this.buscarListaDistribucion.length > 1) {
      this.gridApi.setQuickFilter(this.buscarListaDistribucion);
    } else {
      this.gridApi.setQuickFilter('');
    }
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

  volver() {
    this.e1 -= 1;
    this.btnText = 'Continuar';
    this.btnClass = 'btn-continuar';
    document.getElementById('cardDivLista').scrollIntoView(true);
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>
