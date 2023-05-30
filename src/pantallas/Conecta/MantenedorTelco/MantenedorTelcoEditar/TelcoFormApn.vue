<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <StepTitle>Editar APN</StepTitle>
          <v-divider></v-divider>

          <br />

          <v-layout row wrap style="padding-right:0px">
            <v-flex xs12 sm6 md6>
              <div align="left">
                <BuscadorOperacionCrud
                  :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
                />
              </div>
            </v-flex>

            <v-flex xs12 sm6 md6 style="padding-right:0px;">
              <div align="right" style="padding-top:6px;padding-right:0px;">
                <v-btn
                  style="padding-right:20px; padding-right: 20px; display: block; margin: 0 0 0 auto; margin-top: 15px"
                  color="#ffe800"
                  @click="crear_apn"
                >
                  <v-icon dark left style="color: black;"
                    >add_circle_outline</v-icon
                  >
                  <span style="color: black;">Crear</span>
                </v-btn>
              </div>
            </v-flex>
          </v-layout>
          <div align="left" class="telcoapn">
            <MantenedorGridSinCodigo
              :grid-options="gridOptions"
              :funcionalidad-id="funcionalidad"
            />
          </div>
        </v-container>
      </v-card>
    </v-flex>
    <div v-if="showReporteGeneradoCrearApn" class="wrap-evidencia">
      <div class="ModalEdit">
        <!-- Modal content -->
        <div class="modalEnvio-content" id="desactivadores">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Crear APN</h2>
            </div>
            <div class="buttonClose buttonCloseEvidencia" align="right">
              <v-btn flat small color="primary" @click="closeReporteApn()">
                <v-icon class="importExportBtnIcon">close</v-icon>&nbsp;&nbsp;
                <span class="importExportBtnTexto">Cerrar</span>
              </v-btn>
            </div>
            <div align="center">
              <v-flex md10>
                <v-card class="rounded-card">
                  <v-form ref="form" lazy-validation class="col-md-12">
                    <v-container
                      grid-list-md
                      style="padding: 30px 40px 50px 40px;"
                    >
                      <div class="boton_crear" style="">
                        <v-btn
                          @click="guardarApn"
                          class="icon"
                          style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block; margin: 0 0 0 auto;"
                        >
                          <span style="color: white;">Guardar</span>
                        </v-btn>
                      </div>
                      <FormFieldsContainer titulo="Crear APN">
                        <slot name="prependInformacionGeneral" />

                        <v-flex xs4 sm4 md4>
                          <v-text-field
                            :label="formFields.id.label"
                            v-model="formFields.id.value"
                            disabled
                          />
                        </v-flex>
                        <v-flex xs4 sm4 md4>
                          <v-text-field
                            :label="formFields.apn.label"
                            v-model="formFields.apn.value"
                          />
                        </v-flex>
                      </FormFieldsContainer>
                    </v-container>
                  </v-form>
                </v-card>
              </v-flex>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showReporteGeneradoEditarApn" class="wrap-evidencia">
      <div class="ModalEdit">
        <!-- Modal content -->
        <div class="modalEnvio-content" id="desactivadores">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Editar APN</h2>
            </div>
            <div class="buttonClose buttonCloseEvidencia" align="right">
              <v-btn
                flat
                small
                color="primary"
                @click="closeReporteApnEditar()"
              >
                <v-icon class="importExportBtnIcon">close</v-icon>&nbsp;&nbsp;
                <span class="importExportBtnTexto">Cerrar</span>
              </v-btn>
            </div>
            <div align="center">
              <v-flex md10>
                <v-card class="rounded-card">
                  <v-form ref="form" lazy-validation class="col-md-12">
                    <v-container
                      grid-list-md
                      style="padding: 30px 40px 50px 40px;"
                    >
                      <div class="boton_crear" style="">
                        <v-btn
                          @click="editarApn"
                          class="icon"
                          style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block; margin: 0 0 0 auto;"
                        >
                          <span style="color: white;">Guardar</span>
                        </v-btn>
                      </div>
                      <FormFieldsContainer titulo="Editar APN">
                        <slot name="prependInformacionGeneral" />

                        <v-flex xs4 sm4 md4>
                          <v-text-field
                            :label="formFields.id.label"
                            v-model="formFields.id.value"
                            disabled
                          />
                        </v-flex>
                        <v-flex xs4 sm4 md4>
                          <v-text-field
                            :label="formFields.apn.label"
                            v-model="formFields.apn.value"
                          />
                        </v-flex>
                      </FormFieldsContainer>
                    </v-container>
                  </v-form>
                </v-card>
              </v-flex>
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-confirmacion
      :show="dialogConfirmacion"
      :nombre="nombreApnElminar"
      :titulo="'Eliminar la APN ' + nombreApnElminar"
      :mensaje="$t('Despúes de realizada la acción no se podrá reversar.')"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
    ></app-confirmacion>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
} from 'ag-grid-community';

import MantenedorGridSinCodigo from '@/reusable/Grid/MantenedorGridSinCodigo.vue';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { Snotify } from '@/snotify/Snotify';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { fetchReportesSerie } from '../fetchReporteSerie';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { actionsEvent } from '@/setup';
import Confirmation from '@/components/Confirmation.vue';

@Component({
  components: {
    StepTitle,
    BuscadorOperacionCrud,
    MantenedorGridSinCodigo,
    FormFieldsContainer,
    'app-confirmacion': Confirmation,
  },
})
export default class TelcoFormApn extends ComponenteBase {
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.MantenedorTelcoEditarApn;
  @Prop({ default: false }) disabled: boolean;
  @Prop({ default: null }) telcoid: any;

  /* ComponenteBase */
  ordesList: any[] = [];
  showReporteGeneradoCrearApn: boolean = false;
  showReporteGeneradoEditarApn: boolean = false;
  dialogConfirmacion: boolean = false;
  id_apn: any = '';
  idEliminar: any = '';
  telcoidEliminar: any = '';
  nombreApnElminar: any = '';

  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);

  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'TelcoId',
        field: 'telcoid',
        lockVisible: true,
        hide: true,
      },
      {
        headerName: 'Id',
        field: 'telcoapnid',
        lockVisible: true,
      },
      {
        headerName: 'APN',
        field: 'telcoapnname',
        lockVisible: true,
      },
    ],
    pagination: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
  };

  formFields: FormFieldDefMap = {
    id: {
      label: 'Id',
      id: '',
      value: '',
    },
    apn: {
      label: 'APN',
      id: '',
      value: '',
    },
  };

  crear_apn() {
    this.formFields.id.value = this.id_apn;
    this.showReporteGeneradoCrearApn = true;
  }
  closeReporteApn() {
    this.showReporteGeneradoCrearApn = false;
  }
  async guardarApn() {
    let self = this;
    if (this.formFields.apn.value == '') {
      self.$snotify.error('Debe incluir el nombre de la APN', {
        timeout: 3000,
      });
      this.loadingService.hideLoading();
      return;
    }
    return fetchReportesSerie(
      {
        usuarioid: JSON.parse(localStorage.getItem('user')).id,
        usuariorut: JSON.parse(localStorage.getItem('user')).rutClienteDefecto,
        clienteid: JSON.parse(localStorage.getItem('clienteDefecto')),
        bmoduloid: this.funcionalidad,
        telcoid: this.telcoid,
        telcoapnid: this.formFields.id.value,
        telcoapnname: this.formFields.apn.value,
      },
      'mantenedor_telco/crear_apn'
    )
      .then(async (data: any) => {
        if (self.formFields.apn.value == '') {
          self.$snotify.error('El campo APN debe ser diligenciado', {
            timeout: 3000,
          });
        }
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.ordesList = await this.getReportes(this.telcoid);
          this.gridApi.setRowData(this.ordesList);

          self.$snotify.success(
            'Ha creado con éxito el APN :' + this.formFields.apn.value,
            { timeout: 3000 }
          );
          this.formFields.apn.value = '';
          this.showReporteGeneradoCrearApn = false;
        } else {
          this.formFields.apn.value = '';
          return;
        }
      })
      .catch((error: any) => {
        self.$snotify.error(
          'Ha ocurrido un error al crear el APN :' + this.formFields.apn.value,
          { timeout: 3000 }
        );
        this.showReporteGeneradoCrearApn = false;
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }
  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  async getReportes(telcoid: any) {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie({ telcoid: self.telcoid }, 'mantenedor_telco/apn')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.id_apn = Number(data.data.CONTADOR[0].max) + 1;
          return data.data.data.LISTA;
        } else {
          this.id_apn = 1;
          return;
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
  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = await this.getReportes(this.telcoid);
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
  }
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionEditarApn: PermisoAccion = {
    accionCodigo: 97,
    visible: false,
  };

  accionElimnarApn: PermisoAccion = {
    accionCodigo: 96,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionEditarApn,
    this.accionElimnarApn,
  ];
  constructor() {
    super();
    actionsEvent.onEditarApn(this.handleVerEditarClickApn);
    actionsEvent.onEliminarApn(this.handleElminarApn);
  }
  handleVerEditarClickApn(params: ICellRendererParams) {
    this.showReporteGeneradoEditarApn = true;
    (this.formFields.id.value = params.data.telcoapnid),
      (this.formFields.apn.value = params.data.telcoapnname),
      (this.telcoid = params.data.telcoid);
  }
  async editarApn() {
    let self = this;
    this.loadingService.showLoading();
    if (this.formFields.apn.value == '') {
      self.$snotify.error('Debe incluir el nombre de la APN', {
        timeout: 3000,
      });
      this.loadingService.hideLoading();
      return;
    }
    return fetchReportesSerie(
      {
        usuarioid: JSON.parse(localStorage.getItem('user')).id,
        usuariorut: JSON.parse(localStorage.getItem('user')).rutClienteDefecto,
        clienteid: JSON.parse(localStorage.getItem('clienteDefecto')),
        telcoapnname: this.formFields.apn.value,
        telcoapnid: this.formFields.id.value,
        telcoid: this.telcoid,
        bmoduloid: this.funcionalidad,
      },
      'mantenedor_telco/editar_apn'
    )
      .then(async (data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.ordesList = await this.getReportes(this.telcoid);
          this.gridApi.setRowData(this.ordesList);
          this.formFields.apn.value = '';
          this.showReporteGeneradoEditarApn = false;
          self.$snotify.success(data.data.MENSAJE_RESPUESTA, {
            timeout: 3000,
          });
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

  closeReporteApnEditar() {
    this.formFields.apn.value = '';
    this.showReporteGeneradoEditarApn = false;
  }

  handleElminarApn(params: ICellRendererParams) {
    this.idEliminar = params.data.telcoapnid;
    this.telcoidEliminar = this.telcoid;
    this.dialogConfirmacion = true;
    this.nombreApnElminar = params.data.telcoapnname;
  }
  async confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    let self = this;

    this.dialogConfirmacion = false;

    if (val) {
      let self = this;
      this.loadingService.showLoading();

      return fetchReportesSerie(
        {
          usuarioid: JSON.parse(localStorage.getItem('user')).id,
          usuariorut: JSON.parse(localStorage.getItem('user'))
            .rutClienteDefecto,
          bmoduloid: this.funcionalidad,
          clienteid: JSON.parse(localStorage.getItem('clienteDefecto')),
          telcoid: self.telcoidEliminar,
          telcoapnid: self.idEliminar,
        },
        'mantenedor_telco/eliminar_apn'
      )
        .then(async (data: any) => {
          if (data.data.CODIGO_RESPUESTA == '1') {
            this.ordesList = await this.getReportes(this.telcoid);
            this.gridApi.setRowData(this.ordesList);

            self.$snotify.success(data.data.MENSAJE_RESPUESTA, {
              timeout: 3000,
            });
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
  }
}
</script>
<style>
.telcoapn div.ag-layout-auto-height:nth-child(3) > div:nth-child(1) {
  display: none;
}
.telcoapn
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}
.telcoapn .estilo-grilla,
#gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}
.telcoapn
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.ModalEdit {
  position: fixed;
  z-index: 1;
  padding-top: 100px;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}
#desactivadores {
  min-width: 1000px;
  max-width: 500px;
  width: 30%;
  background-color: #e9ebee;
}
.desplegable {
  border-radius: 0;
  z-index: 99999 !important;
}
</style>
