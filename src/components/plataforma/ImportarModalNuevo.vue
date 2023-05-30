<!-- version 1.1 -->
<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivTLI">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>Importar</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              :class="btnClass"
              @click="continuar(), cierraMenu()"
              :disabled="!validForm || btnBloquear"
              >{{ btnText }}</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />
        <v-stepper v-model="e1">
          <v-stepper-step
            v-show="informacionGeneral.visible"
            :complete="e1 > informacionGeneral.step"
            :step="informacionGeneral.step"
            >Información General</v-stepper-step
          >
          <v-divider></v-divider>
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
                          <v-flex md6>
                            <v-select
                              v-model="tipoCarga"
                              :items="tiposCarga"
                              label="Tipo Carga"
                              icon="fas fa-angle-down"
                              item-value="id"
                              item-text="modulo"
                              v-validate="'required'"
                              :error-messages="errors.collect('tipoCarga')"
                              data-vv-name="tipoCarga"
                              no-data-text="Sin resultados"
                              @change="limpiarCampos()"
                            ></v-select>
                          </v-flex>
                          <v-flex
                            md1
                            style="padding-top:24px; padding-right:20px;"
                          >
                            <v-btn
                              text
                              icon
                              color="white"
                              :class="!tipoCarga ? 'disable-events' : ''"
                            >
                              <v-icon
                                title="Descargar Formato"
                                :disabled="!tipoCarga"
                                @click="descargaFormato()"
                                >assignment_returned</v-icon
                              >
                            </v-btn>
                          </v-flex>
                          <v-flex xs12 sm12 md12>
                            <v-text-field
                              label="Descripción"
                              :counter="200"
                              v-validate="'max:200|required'"
                              data-vv-name="descripcion"
                              v-model="descripcion"
                              type="text"
                              :error-messages="errors.collect('descripcion')"
                            ></v-text-field>
                          </v-flex>
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
                              accept=".csv"
                              @change="onFilePicked"
                              :key="idkey"
                            />
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
    </v-dialog>
    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="tituloMensaje"
      :mensaje="$t('mensajes.crud.importar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.importar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.importar.btnCancelar')"
    ></app-confirmacion>
    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnNo="'CONTINUAR IMPORTANDO'"
      :textoBtnSi="'NO GUARDAR'"
    ></app-confirmacion>
    <app-confirmacion
      :show="dialogError"
      :titulo="'Archivo no válido'"
      :mensaje="'¿Desea descargar los registros con problemas?'"
      v-on:modalConfirmationEmit="confirmCallbackError($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></app-confirmacion>

    <!-- SELECCION ERROR FORMATO -->
    <div class="text-xs-center">
      <v-dialog v-model="showAlertaErrorFormato" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Archivo no válido</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>
            {{ mensajeAlertaErrorFormato }}
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="confirmCallbackErrorFormato()">
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div class="text-xs-center">
      <v-dialog v-model="showErrorImportar" persistent :max-width="400">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
              >Error al Importar</v-toolbar-title
            >
          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text
            >No posee los permisos necesarios para poder importar un
            archivo</v-card-text
          >
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="#526da5" small @click="closeModal()">
              <span style="color: white;">Aceptar</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <!-- -->
  </v-layout>
</template>

<script lang="ts">
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { ServicioProxy } from '@/config/enums';

import { Component, Prop, Watch } from 'vue-property-decorator';
import store from '@/store';
import { AxiosVue } from '@/AxiosVue';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { Funcionalidades } from '@/config/funcionalidades';
import { Validator } from 'vee-validate';
import { differenceBy } from 'lodash';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadosService } from '@/services/estadosService';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
import {
  GridApi,
  ColumnApi,
  ColDef,
  CellContextMenuEvent,
  GridReadyEvent,
} from 'ag-grid-community';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class ImportarModalNuevo extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Importar;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Crear - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Importar,
  };

  permisosTotales: PermisoAccionVm[] = [this.informacionGeneral];

  //Variables globales
  $snotify: any;
  e1: number = 1;
  btnText: string = 'Continuar';
  btnClass: string = 'btn-continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  controller: string = 'importacion';
  controllerCarga: string = 'cargaArchivo';
  loadingService = new LoadingService();
  search: string = '';
  seleccionoTodosClientes: boolean = false;
  buscarCliente: string = '';

  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  dialogError: boolean = false;

  dictionaryFormErrors: any = {};
  handleErrors: HandleErrors = new HandleErrors();

  //grilla
  localeText: any = config.agGridTextos;
  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefsCliente: Array<ColDef> = [];

  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  btnBloquear: Boolean = false;
  estadoSeleccionado: any = null;

  tiposCarga: any[] = [];
  tipoCarga: number = null;
  idkey: number = 0;
  fileName: string = '';
  fileSize: number = 0;
  csvUrl: any = null;
  csvFile: any = null;
  descripcion: any = '';
  dataExportar: string = '';
  zipExportar: string = '';
  tituloMensaje: any = '';
  showAlertaErrorFormato: boolean = false;
  showErrorImportar: boolean = false;
  mensajeAlertaErrorFormato: any = '';

  //CONTEXTOS INSTANCIAS ------------------------------------------------------------------------------------
  clienteId: number = config.getClienteSesion();
  usuarioId: number = store.state.userId;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Importacion);
  //---------------------------------------------------------------------------------------------------------

  async mounted() {
    await this.initialize();
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Guardar';
    this.btnClass = 'btn-grabar';
    this.btnBloquear = false;
    this.idkey += 1;

    if (value) {
      await this.$validator.reset();
      this.loadingService.showLoading();
      await this.cargaTipos();
      this.loadingService.hideLoading();
    }
  }
  async initialize() {
    this.dictionaryFormErrors = {
      custom: {
        tipoCarga: {
          required: () => config.errorMensajes.textoRequerido,
        },
        descripcion: {
          max: config.errorMensajes.maxLength,
          required: () => config.errorMensajes.textoRequerido,
        },
        archivo: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };

    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  created() {
    const self = this;
    this.chequearPermisos();
    Validator.extend('extension', {
      getMessage(field: any, params: any, data: any) {
        return (data && data.message) || '* El tipo de archivo debe ser ".csv"';
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: self.validaExtesion(),
            data: self.validaExtesion()
              ? undefined
              : { message: '* El tipo de archivo debe ser ".csv"' },
          });
        });
      },
    });

    Validator.extend('tamanio', {
      getMessage(field: any, params: any, data: any) {
        return (
          (data && data.message) ||
          '* El peso del archivo no puede superar los 5 MB'
        );
      },
      validate(value: any) {
        return new Promise(resolve => {
          resolve({
            valid: self.validaTamaño(),
            data: self.validaTamaño()
              ? undefined
              : { message: '* El peso del archivo no puede superar los 5 MB' },
          });
        });
      },
    });
  }

  validaExtesion() {
    if (this.fileName != '') {
      var ext = this.fileName.substring(
        this.fileName.length - 3,
        this.fileName.length
      );
      if (ext == 'csv' || ext == 'CSV') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  validaTamaño() {
    //Valor Anterior 5242880
    //Valor Nuevo 5119612
    if (this.fileName != '') {
      if (this.fileSize > 0 && this.fileSize <= 5119612) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  onFilePicked(e: any) {
    let self = this;
    var tgt = e.target || window.event.srcElement,
      files = tgt.files;
    this.fileName = files[0].name;
    if (FileReader && files && files.length) {
      this.fileSize = files[0].size;
      var fr = new FileReader();

      fr.onload = function() {
        var base64 = fr.result;
        self.csvFile = base64;
      };
      fr.readAsDataURL(files[0]);
    }
    this.idkey += 1;
  }

  async cargaTipos() {
    const self = this;
    await this.axios.http
      .get(`${this.controller}/${this.clienteId}/${this.usuarioId}/getModulos`)
      .then(respServer => {
        self.tiposCarga = respServer.data;
        if (self.tiposCarga.length == 0) {
          self.showErrorImportar = true;
        }
      })
      .catch(err => {
        if (!err.response) {
          this.$snotify.error('Ocurrió un error al cargar los modulos.');
        }
      });
  }

  cierraMenu() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }

  async confirmCallback(aceptado: boolean) {
    this.dialogConfirmacion = false;

    if (aceptado) {
      const resultadoValidacion = await this.$validator.validateAll();

      if (resultadoValidacion) {
        this.btnBloquear = true;
        await this.nuevo();
      }
    }
    this.btnBloquear = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  confirmCallbackError(val: boolean) {
    this.dialogError = false;
    if (val) {
      var byteCharacters = atob(this.dataExportar);
      var byteNumbers = new Array(byteCharacters.length);
      for (var i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);

      // construimos un blob con el array de byte
      var blob1 = new Blob([byteArray], {
        type: 'text/csv;charset=windows-1252',
      });
      var fileName1 = `${this.fileName}`; // + '.csv';

      //Mandamos a construir  y descargar el archivo
      this.exportar(blob1, fileName1);

      this.$snotify.success('La exportación ha sido finalizada con éxito');
    } else {
      this.closeModal(false);
    }
  }

  errorMSG(error: any, he: HandleErrors, msg: string) {
    he.showError(error, msg);
    this.btnBloquear = false;
  }
  //GRABAR --------------------------------------------------------------------------------------
  continuar() {
    this.$validator.validateAll().then(res => {
      if (res) {
        const nombreModulo = this.tiposCarga.find(
          (x: any) => x.id === this.tipoCarga
        );
        this.tituloMensaje = this.$t('mensajes.crud.importar.titulo', {
          entidad: nombreModulo.modulo,
        });
        this.dialogConfirmacion = true;
        this.btnBloquear = true;
      }
    });
  }

  exportar(blob: any, fileName: any) {
    var url = window.URL.createObjectURL(blob);

    var anchorElem = document.createElement('a');
    //anchorElem.style = "display: none";
    anchorElem.href = url;
    anchorElem.download = fileName;

    document.body.appendChild(anchorElem);
    anchorElem.click();

    document.body.removeChild(anchorElem);

    // On Edge, revokeObjectURL should be called only after
    // a.click() has completed, atleast on EdgeHTML 15.15048
    setTimeout(function() {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }

  async nuevo() {
    const he = new HandleErrors();

    var base64 = this.csvFile.substring(21);

    const model = {
      descripcion: this.descripcion,
      nombre: this.fileName,
      moduloId: this.tipoCarga,
      archivo: base64,
    };

    try {
      this.loadingService.showLoading();
      const response = await this.axios.http.post(
        `${this.controllerCarga}/validaArchivo`,
        model
      );
      if (response.data.errorArchivoBase64 != null) {
        this.dataExportar = response.data.errorArchivoBase64;
        this.dialogError = true;
      } else if (response.data.error == true) {
        this.mensajeAlertaErrorFormato = response.data.errorMensaje;
        this.showAlertaErrorFormato = true;
      } else {
        this.closeSuccess();
      }
    } catch (error) {
      if (error.response !== undefined) {
        if (error.response.status !== 401) {
          this.errorMSG(
            error,
            he,
            'Ha ocurrido un problema al intentar cargar el archivo.'
          );
        }
      } else {
        this.errorMSG(
          error,
          he,
          'Ha ocurrido un problema al intentar cargar el archivo.'
        );
      }
    } finally {
      this.loadingService.hideLoading();
    }
  }

  closeSuccess() {
    this.loadingService.hideLoading();
    this.closeModal(false);
    this.$snotify.success('Importación ha sido realizada de forma exitosa');
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivTLI').scrollIntoView(true);
    this.btnBloquear = false;
    this.showErrorImportar = false;
    this.showAlertaErrorFormato = false;
    this.buscarCliente = '';
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.errors.clear();

    //seteo variables
    this.tiposCarga = [];
    this.tipoCarga = null;
    this.idkey = 0;
    this.fileName = '';
    this.fileSize = 0;
    this.csvFile = null;
    this.descripcion = '';
    this.mensajeAlertaErrorFormato = '';
  }
  async descargaFormato() {
    if (this.tipoCarga) {
      const responseZip = await this.axios.http.get(
        `${this.controller}/${this.tipoCarga}/${this.clienteId}/GetFormato`
      );
      if (responseZip.data.error == false) {
        this.zipExportar = responseZip.data.archivoBase64;
        if (this.zipExportar) {
          const archivoName = responseZip.data.nombre;
          var byteCharacters = atob(this.zipExportar);
          var byteNumbers = new Array(byteCharacters.length);
          for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          var byteArray = new Uint8Array(byteNumbers);

          // construimos un blob con el array de byte
          var blob1 = new Blob([byteArray], {
            type: 'application/octet-stream',
          });
          this.exportar(blob1, archivoName);
        }
      }
    }
  }

  confirmCallbackErrorFormato() {
    this.showAlertaErrorFormato = false;
  }

  limpiarCampos() {
    this.$validator.reset();
    this.descripcion = '';
    this.fileName = '';
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
.disable-events {
  pointer-events: none !important;
}
</style>
