<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <StepTitle>Stock Crítico</StepTitle>
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
                  @click="crear_stock"
                >
                  <v-icon dark left style="color: black;"
                    >add_circle_outline</v-icon
                  >
                  <span style="color: black;">Crear</span>
                </v-btn>
              </div>
            </v-flex>
          </v-layout>
          <div align="left" class="telcostock">
            <MantenedorGridSinCodigo
              :grid-options="gridOptions"
              :funcionalidad-id="funcionalidad"
            />
          </div>
        </v-container>
      </v-card>
    </v-flex>
    <!-- Editar -->
    <div v-if="showReporteGeneradoEditar" class="wrap-evidencia">
      <div class="ModalEdit">
        <!-- Modal content -->
        <div class="modalEnvio-content" id="desactivadores">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Editar Stock</h2>
            </div>
            <div class="buttonClose buttonCloseEvidencia" align="right">
              <v-btn flat small color="primary" @click="closeReporteEditar()">
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
                          @click="editarStock"
                          class="icon"
                          style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block; margin: 0 0 0 auto;"
                        >
                          <span style="color: white;">Guardar</span>
                        </v-btn>
                      </div>
                      <FormFieldsContainer titulo="Editar Stock">
                        <slot name="prependInformacionGeneral" />

                        <v-flex xs4 sm4 md4>
                          <v-text-field
                            :label="formFields.sim.label"
                            v-model="formFields.sim.value"
                            disabled
                          />
                        </v-flex>
                        <v-flex xs4 sm4 md4>
                          <v-text-field
                            :label="formFields.stock.label"
                            v-model="formFields.stock.value"
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
    <!-- Crear -->
    <div v-if="showReporteGeneradoCrear" class="wrap-evidencia">
      <div class="ModalEdit">
        <!-- Modal content -->
        <div class="modalEnvio-content" id="desactivadores">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Crear Stock</h2>
            </div>
            <div class="buttonClose buttonCloseEvidencia" align="right">
              <v-btn flat small color="primary" @click="closeReportecrear()">
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
                          @click="crearStock"
                          class="icon"
                          style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block; margin: 0 0 0 auto;"
                        >
                          <span style="color: white;">Guardar</span>
                        </v-btn>
                      </div>
                      <FormFieldsContainer titulo="Crear Stock">
                        <slot name="prependInformacionGeneral" />

                        <v-flex xs4 sm4 md4 class="desplegable">
                          <v-autocomplete
                            :label="formFields.sim.label"
                            v-model="formFields.sim.value"
                            :items="tipolist"
                            item-text="tiposimname"
                            item-value="tiposimid"
                          />
                        </v-flex>
                        <v-flex xs4 sm4 md4>
                          <v-text-field
                            :label="formFields.stock.label"
                            v-model="formFields.stock.value"
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
      :nombre="nombreStockElminar"
      :titulo="'Eliminar el Stock de ' + nombreStockElminar"
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
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
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
import { actionsEvent } from '@/setup';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
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
export default class TelcoFormStock extends ComponenteBase {
  @Prop({ default: false }) disabled: boolean;
  @Prop({ default: null }) telcoid: any;

  /* ComponenteBase */
  ordesList: any[] = [];
  serverSide: any;
  showReporteGeneradoEditar: boolean = false;

  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.MantenedorTelcoEditarStock;

  /* aggrid */

  gridApi: GridApi = null;
  tipolist: any[] = [];
  showReporteGeneradoCrear: boolean = false;
  dialogConfirmacion: boolean = false;
  /* template */
  async getplan() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      {
        '': '',
      },
      'mantenedor_telco/tipo_sim'
    )
      .then((data: any) => {
        if (data.data.MENSAJE_RESPUESTA == 'sin registros') {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        } else if (data.data.CODIGO_RESPUESTA == '1') {
          self.tipolist = data.data.data;
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
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'tiposimid',
        field: 'tiposimid',
        lockVisible: true,
        hide: true,
      },
      {
        headerName: 'TelcoId',
        field: 'telcoid',
        lockVisible: true,
        hide: true,
      },
      {
        headerName: 'Tipo SIM',
        field: 'tiposimname',
        lockVisible: true,
      },
      {
        headerName: 'Stock',
        field: 'telcostockcritico',
        lockVisible: true,
      },
    ],
    pagination: true,
    singleClickEdit: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    suppressCopyRowsToClipboard: true,
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();
  crear_stock() {
    this.showReporteGeneradoCrear = true;
  }
  closeReportecrear() {
    this.formFields.stock.value = '';
    this.showReporteGeneradoCrear = false;
  }

  formFields: FormFieldDefMap = {
    simid: {
      label: 'id SIM',
      id: '',
      value: '',
    },
    sim: {
      label: 'Tipo SIM',
      id: '',
      value: '',
    },
    stock: {
      label: 'Stock',
      id: '',
      value: '',
    },
  };

  async getReportes(telcoid: any) {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { telcoid: self.telcoid },
      'mantenedor_telco/stock'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          console.log(data.data.data.LISTA);
          return data.data.data.LISTA;
        } else {
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
    console.log(this.tipolist);
  }
  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionEditarStock: PermisoAccion = {
    accionCodigo: 98,
    visible: false,
  };

  accionEliminarStock: PermisoAccion = {
    accionCodigo: 99,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionEditarStock,
    this.accionEliminarStock,
  ];
  constructor() {
    super();
    actionsEvent.onEditarStock(this.handleVerEditarStock);
    actionsEvent.onEliminarStock(this.handleElminarStock);
  }
  handleVerEditarStock(params: ICellRendererParams) {
    (this.formFields.simid.value = params.data.tiposimid),
      (this.formFields.sim.value = params.data.tiposimname),
      (this.formFields.stock.value = params.data.telcostockcritico),
      (this.telcoid = params.data.telcoid);
    this.showReporteGeneradoEditar = true;
  }
  async editarStock() {
    let self = this;
    this.loadingService.showLoading();
    if (this.formFields.stock.value == '') {
      self.$snotify.error('Debe incluir un Stock', {
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
        telcostockcritico: this.formFields.stock.value,
        tiposimid: this.formFields.simid.value,
        telcoid: this.telcoid,
      },
      'mantenedor_telco/editar_stock'
    )
      .then(async (data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.ordesList = await this.getReportes(this.telcoid);
          this.gridApi.setRowData(this.ordesList);
          this.formFields.stock.value = '';
          this.showReporteGeneradoEditar = false;
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
  closeReporteEditar() {
    this.formFields.stock.value = '';
    this.showReporteGeneradoEditar = false;
  }

  nombreStockElminar: any = '';
  tipoSimIdEliminar: any = '';
  handleElminarStock(params: ICellRendererParams) {
    (this.tipoSimIdEliminar = params.data.tiposimid),
      (this.telcoid = params.data.telcoid);
    this.nombreStockElminar = params.data.tiposimname;
    this.dialogConfirmacion = true;
  }
  async confirmCallback(val: boolean) {
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
          telcoid: this.telcoid,
          tiposimid: this.tipoSimIdEliminar,
        },
        'mantenedor_telco/eliminar_stock'
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
  async crearStock() {
    let self = this;
    this.loadingService.showLoading();
    if (this.formFields.stock.value == '') {
      self.$snotify.error('Debe incluir un Stock', {
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
        telcostockcritico: this.formFields.stock.value,
        tiposimid: this.formFields.sim.value,
        telcoid: this.telcoid,
      },
      'mantenedor_telco/crear_stock'
    )
      .then(async (data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.ordesList = await this.getReportes(this.telcoid);
          this.gridApi.setRowData(this.ordesList);
          this.formFields.stock.value = '';
          this.formFields.sim.value = '';
          this.showReporteGeneradoCrear = false;
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
  async mounted() {
    this.getplan();
  }
}
</script>
<style>
.telcostock div.ag-layout-auto-height:nth-child(3) > div:nth-child(1) {
  display: none;
}
.telcostock
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}
.telcostock .estilo-grilla,
#gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}
.telcostock
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
