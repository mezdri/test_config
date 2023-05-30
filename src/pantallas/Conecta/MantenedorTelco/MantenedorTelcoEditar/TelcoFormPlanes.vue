<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <StepTitle>Planes Telco</StepTitle>
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
                  @click="crear_plan"
                >
                  <v-icon dark left style="color: black;"
                    >add_circle_outline</v-icon
                  >
                  <span style="color: black;">Crear</span>
                </v-btn>
              </div>
            </v-flex>
          </v-layout>
          <div align="left" class="telcofromplanes">
            <MantenedorGridSinCodigo
              :grid-options="gridOptions"
              :funcionalidad-id="funcionalidad"
            />
          </div>
        </v-container>
      </v-card>
    </v-flex>
    <div v-if="showReporteGenerado" class="wrap-evidencia">
      <div class="ModalEdit">
        <!-- Modal content -->
        <div class="modalEnvio-content" id="desactivadores">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Crear Plan</h2>
            </div>
            <div class="buttonClose buttonCloseEvidencia" align="right">
              <v-btn flat small color="primary" @click="closeReporte()">
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
                          @click="guardar"
                          class="icon"
                          style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block; margin: 0 0 0 auto;"
                        >
                          <span style="color: white;">Guardar</span>
                        </v-btn>
                      </div>
                      <FormFieldsContainer titulo="Crear Plan">
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
                            :label="formFields.plan.label"
                            v-model="formFields.plan.value"
                          />
                        </v-flex>
                        <v-flex xs4 sm4 md4 class="desplegable">
                          <v-autocomplete
                            :label="formFields.tipo.label"
                            v-model="formFields.tipo.value"
                            :items="planlist"
                            item-text="tipo_sim"
                            item-value="id"
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
    <div v-if="showReporteGeneradoEditar" class="wrap-evidencia">
      <div class="ModalEdit">
        <!-- Modal content -->
        <div class="modalEnvio-content" id="desactivadores">
          <div>
            <div class="titleEvidencia">
              <h2 class="importExportBtnIcon">Editar Plan</h2>
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
                          @click="editarPlan"
                          class="icon"
                          style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block; margin: 0 0 0 auto;"
                        >
                          <span style="color: white;">Guardar</span>
                        </v-btn>
                      </div>
                      <FormFieldsContainer titulo="Editar Plan">
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
                            :label="formFields.plan.label"
                            v-model="formFields.plan.value"
                          />
                        </v-flex>
                        <v-flex xs4 sm4 md4 class="desplegable">
                          <v-combobox
                            :label="formFields.tipo.label"
                            v-model="formFields.tipo.value"
                            :items="planlist"
                            item-text="tipo_sim"
                            item-value="id"
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
      :nombre="nombrePlanElminar"
      :titulo="'Eliminar el plan ' + nombrePlanElminar"
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
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import { fetchReportesSerie } from '../fetchReporteSerie';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import Confirmation from '@/components/Confirmation.vue';
import { actionsEvent } from '@/setup';
@Component({
  components: {
    StepTitle,
    BuscadorOperacionCrud,
    MantenedorGridSinCodigo,
    FormFieldsContainer,
    'app-confirmacion': Confirmation,
  },
})
export default class TelcoFormPlanes extends ComponenteBase {
  readonly funcionalidad: Funcionalidades =
    Funcionalidades.MantenedorTelcoEditar;
  @Prop({ default: false }) disabled: boolean;
  @Prop({ default: null }) telcoid: any;

  /* ComponenteBase */
  ordesList: any[] = [];
  plan: any;
  tipo: any;
  id: any;
  showReporteGenerado: boolean = false;
  showReporteGeneradoEditar: boolean = false;
  dialogConfirmacion: boolean = false;
  planlist: any[] = [];
  idEliminar: any = '';
  telcoidEliminar: any = '';
  nombrePlanElminar: any = '';
  gridApi: GridApi = null;

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
        field: 'id',
        lockVisible: true,
        hide: true,
      },
      {
        headerName: 'Plan',
        field: 'plan',
        lockVisible: true,
      },
      {
        headerName: 'idsim',
        field: 'tiposimid',
        lockVisible: true,
        hide: true,
      },
      {
        headerName: 'Tipo',
        field: 'tipo',
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
      id: this.id,
      value: this.id,
    },
    plan: {
      label: 'Plan',
      id: '',
      value: '',
    },
    tipo: {
      label: 'Tipo',
      id: '',
      value: '',
    },
  };

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  async getplan() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      {
        telcoid: this.telcoid,
      },
      'mantenedor_telco/get_plan_crear'
    )
      .then((data: any) => {
        if (data.data.MENSAJE_RESPUESTA == 'sin registros') {
          this.formFields.plan.value = '';

          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
        } else if (data.data.CODIGO_RESPUESTA == '1') {
          self.planlist = data.data.TIPO;
          self.id = Number(data.data.CONTADOR[0].max) + 1;
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
  async getReportes(telcoid: any) {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { telcoid: self.telcoid },
      'mantenedor_telco/plan'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data.LISTA;
        } else {
          self.id = 1;
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
  crear_plan() {
    this.formFields.id.value = this.id;
    this.showReporteGenerado = true;
  }
  closeReporte() {
    this.showReporteGenerado = false;
  }
  async guardar() {
    let self = this;
    if (this.formFields.plan.value == '') {
      self.$snotify.error('Debe incluir un Plan', {
        timeout: 3000,
      });
      this.loadingService.hideLoading();
      return;
    }
    if (this.formFields.tipo.value == '') {
      self.$snotify.error('Debe incluir el tipo de SIM', {
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
        telcoid: this.telcoid,
        bmoduloid: this.funcionalidad,
        telcoplanid: this.formFields.id.value,
        telcoplanname: this.formFields.plan.value,
        tiposimid: this.formFields.tipo.value,
      },
      'mantenedor_telco/crear_plan'
    )
      .then(async (data: any) => {
        if (self.formFields.plan.value == '') {
          self.$snotify.error('El campo Estado debe ser diligenciado', {
            timeout: 3000,
          });
        }
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.ordesList = await this.getReportes(this.telcoid);
          this.gridApi.setRowData(this.ordesList);
          self.id = self.id + 1;
          self.$snotify.success(
            'Ha creado con éxito el plan :' + this.formFields.plan.value,
            { timeout: 3000 }
          );
          this.formFields.plan.value = '';
          this.formFields.tipo.value = '';
          this.showReporteGenerado = false;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return;
        }
      })
      .catch((error: any) => {
        self.$snotify.error(
          'Ha ocurrido un error al crear el plan :' +
            this.formFields.plan.value,
          { timeout: 3000 }
        );
        this.showReporteGenerado = false;
      })
      .finally(() => {
        (this.formFields.plan.value = ''),
          (this.formFields.tipo.value = ''),
          this.loadingService.hideLoading();
        return null;
      });
  }

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionEditar: PermisoAccion = {
    accionCodigo: 3,
    visible: false,
  };

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionEditar,
    this.accionEliminar,
  ];
  constructor() {
    super();
    actionsEvent.onEditar(this.handleVerEditarClickPlan);
    actionsEvent.onEliminar(this.handleElminarPlan);
  }
  tipo_sim: any = {};
  handleVerEditarClickPlan(params: ICellRendererParams) {
    this.showReporteGeneradoEditar = true;
    this.formFields.id.value = params.data.id;
    this.formFields.plan.value = params.data.plan;
    this.formFields.tipo.value = {
      id: params.data.tiposimid,
      tipo_sim: params.data.tipo,
    };

    this.telcoid = params.data.telcoid;
    console.log(this.tipo_sim);
  }
  async editarPlan() {
    let self = this;
    console.log(this.tipo_sim);
    this.loadingService.showLoading();
    if (this.formFields.plan.value == '') {
      self.$snotify.error('Debe incluir un Plan', {
        timeout: 3000,
      });
      this.loadingService.hideLoading();
      return;
    }
    if (this.formFields.tipo.value == '') {
      self.$snotify.error('Debe incluir el tipo de SIM', {
        timeout: 3000,
      });
      this.loadingService.hideLoading();
      return;
    }
    this.tipo_sim = this.formFields.tipo.value;
    return fetchReportesSerie(
      {
        usuarioid: JSON.parse(localStorage.getItem('user')).id,
        usuariorut: JSON.parse(localStorage.getItem('user')).rutClienteDefecto,
        clienteid: JSON.parse(localStorage.getItem('clienteDefecto')),
        bmoduloid: this.funcionalidad,
        telcoplanname: this.formFields.plan.value,
        tiposimid: self.tipo_sim.id,
        telcoid: self.telcoid,
        telcoplanid: this.formFields.id.value,
      },
      'mantenedor_telco/editar_plan'
    )
      .then(async (data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.ordesList = await this.getReportes(this.telcoid);
          this.gridApi.setRowData(this.ordesList);

          this.showReporteGeneradoEditar = false;
          (this.formFields.plan.value = ''),
            (this.formFields.tipo.value = ''),
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
        (this.formFields.plan.value = ''),
          (this.formFields.tipo.value = ''),
          this.loadingService.hideLoading();
        return null;
      });
  }
  closeReporteEditar() {
    (this.formFields.plan.value = ''),
      (this.formFields.tipo.value = ''),
      (this.showReporteGeneradoEditar = false);
  }

  handleElminarPlan(params: ICellRendererParams) {
    this.idEliminar = params.data.id;
    this.telcoidEliminar = this.telcoid;
    this.dialogConfirmacion = true;
    this.nombrePlanElminar = params.data.plan;
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
          clienteid: JSON.parse(localStorage.getItem('clienteDefecto')),
          bmoduloid: this.funcionalidad,
          telcoid: this.telcoidEliminar,
          telcoplanid: this.idEliminar,
        },
        'mantenedor_telco/eliminar_plan'
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

  async mounted() {
    this.getplan();
  }
}
</script>
<style>
.telcofromplanes
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.telcofromplanes div.ag-layout-auto-height:nth-child(3) > div:nth-child(1) {
  display: none;
}
.telcofromplanes
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}
.telcofromplanes .estilo-grilla,
#gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}
.telcofromplanes
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.desplegable {
  border-radius: 0;
  z-index: 99999 !important;
}
#desactivadores {
  min-width: 1000px;
  max-width: 500px;
  width: 30%;
  background-color: #e9ebee;
}
</style>
