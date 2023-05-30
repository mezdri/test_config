<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <StepTitle>Desactivadores</StepTitle>
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
                  style="padding-right:20px; padding-right: 20px; display: block;

margin: 0 0 0 auto;"
                  color="#ffe800"
                  @click="crear_estado"
                >
                  <v-icon dark left style="color: black;"
                    >add_circle_outline</v-icon
                  >
                  <span style="color: black;">Crear Estado</span>
                </v-btn>
              </div>
            </v-flex>
          </v-layout>
          <div align="left">
            <MantenedorGrid :grid-options="gridOptions" />
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
              <h2 class="importExportBtnIcon">Cambio de Estado</h2>
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
                          style="background-color: rgb(255, 108, 0); border-color: rgb(255, 108, 0); padding-right: 20px; display: block;

margin: 0 0 0 auto;"
                        >
                          <span style="color: white;">Guardar</span>
                        </v-btn>
                      </div>
                      <FormFieldsContainer titulo="Cambio de Estado">
                        <slot name="prependInformacionGeneral" />

                        <v-flex xs4 sm4 md4>
                          <v-text-field
                            :label="formFields.fechadesactivacion.label"
                            v-model="formFields.fechadesactivacion.value"
                            :disabled="modoVer"
                          />
                        </v-flex>
                        <v-flex xs4 sm4 md4>
                          <v-text-field
                            :label="formFields.nota.label"
                            v-model="formFields.nota.value"
                          />
                        </v-flex>
                        <v-flex xs4 sm4 md4>
                          <v-text-field
                            :label="formFields.usuario.label"
                            v-model="formFields.usuario.value"
                            :disabled="modoVer"
                          />
                        </v-flex>
                        <v-flex sm4 md4 class="desplegable">
                          <v-autocomplete
                            v-model="formFields.simestado.value"
                            :label="formFields.simestado.label"
                            :items="simestadolist"
                            item-text="configvalor"
                            item-value="configvalor"
                            @change="getconfigOptions"
                          />
                        </v-flex>
                        <v-flex sm4 md4 class="desplegable">
                          <v-autocomplete
                            v-model="formFields.motivos.value"
                            :label="formFields.motivos.label"
                            :items="motivos"
                            item-text="motiname"
                            item-value="motiid"
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
  </div>
</template>

<script lang="ts">
import moment from 'moment';
import { Component, Prop } from 'vue-property-decorator';
import { GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGrid.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { Snotify } from '@/snotify/Snotify';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import {
  codigoAccionesMenuItem,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { fetchReportesSerie } from './fetchReporteSerie';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';

@Component({
  components: {
    StepTitle,
    BuscadorOperacionCrud,
    CabeceraTabla,
    MantenedorGrid,
    MantenedorGridVerDetalle,
    FormFieldsContainer,
  },
})
export default class SimDesactivadoresForm extends ComponenteBase {
  @Prop({ default: false }) disabled: boolean;
  @Prop({ default: null }) serieNumeroSeleccionado: any;
  @Prop({ default: null }) simestadolistSeleccionado: any;
  @Prop({ default: false }) modoVer: boolean;

  /* ComponenteBase */
  ordesList: any;
  ordesList2: any;
  serverSide: any;
  showReporteGenerado: boolean = false;
  usuariorut: string = '';
  estadoid: string = '';

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: true,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.ReportesSerie;
  simestadolist: any[] = [];
  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Fecha de Desactivación',
        field: 'simdesactivafecha',
        lockVisible: true,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY-MM-DD HH:MM:SS');
        },
      },
      {
        headerName: 'Nota',
        field: 'simdesactivaobs',
        lockVisible: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
        lockVisible: true,
      },
      {
        headerName: 'Estado',
        field: 'configvalor',
        lockVisible: true,
      },
      {
        headerName: 'Motivo',
        field: 'motivo',
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

  /* event handlers */
  motivos: any = [];
  async usuario_actual() {
    return fetchReportesSerie(
      {
        usuarioid: JSON.parse(localStorage.getItem('user')).id,
      },
      'conecta_inventario_sim/usuario'
    )
      .then(async (data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.formFields.usuario.value = data.data.data[0].nombre;
          this.motivos = data.data.motivos;
        } else {
          return;
        }
      })
      .catch((error: any) => {
        return;
      })
      .finally(() => {
        return null;
      });
  }

  async getSerie_by_id(serieNumeroSeleccionado: any) {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      {
        serienumero: serieNumeroSeleccionado,
      },
      'conecta_inventario_sim/desactivadores'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          if (data.data.data[0].STATUS == 'SIN_DATA') {
            self.gridApi.showNoRowsOverlay();
            return;
          }

          return data.data.data;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
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

  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = await this.getSerie_by_id(this.serieNumeroSeleccionado);
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.serverSide = {};
  }
  crear_estado() {
    this.usuario_actual();
    this.showReporteGenerado = true;
  }
  closeReporte() {
    this.showReporteGenerado = false;
  }
  getconfigOptions() {
    if (this.formFields.simestado.value === 'Activado') {
      this.estadoid = '1';
    } else if (this.formFields.simestado.value === 'Activacion lista') {
      this.estadoid = '3';
    } else if (this.formFields.simestado.value === 'Desactivado') {
      this.estadoid = '2';
    } else if (this.formFields.simestado.value === 'Nuevo inactivo') {
      this.estadoid = '4';
    }
  }

  guardar(serieNumeroSeleccionado: any) {
    let self = this;

    return fetchReportesSerie(
      {
        serienumero: this.serieNumeroSeleccionado,
        fecha_modifica: this.formFields.fechadesactivacion.value,
        estado: this.formFields.simestado.value,
        observacion: this.formFields.nota.value,
        usuarioid: JSON.parse(localStorage.getItem('user')).id,
        usuariorut: JSON.parse(localStorage.getItem('user')).rutClienteDefecto,
        estadoid: this.estadoid,
        motiid: this.formFields.motivos.value,
      },
      'conecta_inventario_sim/insertar_estado'
    )
      .then(async (data: any) => {
        if (self.formFields.simestado.value == '') {
          self.$snotify.error('El campo Estado debe ser diligenciado', {
            timeout: 3000,
          });
        }
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.ordesList = await this.getSerie_by_id(
            this.serieNumeroSeleccionado
          );
          this.gridApi.setRowData(this.ordesList);
          self.$snotify.success(
            'Actualizado con éxito el estado a :' +
              this.formFields.simestado.value,
            { timeout: 3000 }
          );
          this.showReporteGenerado = false;
        } else {
          return;
        }
      })
      .catch((error: any) => {
        self.$snotify.success(
          'Actualizado con éxito el estado a :' +
            this.formFields.simestado.label,
          { timeout: 3000 }
        );
        this.showReporteGenerado = false;
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
      { '': '' },
      'conecta_inventario_sim/get_grilla_filters'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.simestadolist = data.data.SIMESTADO;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
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

  formFields: FormFieldDefMap = {
    usuario: {
      label: 'Usuario',
      id: '',
      value: '',
    },
    nota: {
      label: 'Nota',
      id: '',
      value: '',
    },
    fechadesactivacion: {
      label: 'Fecha Desactivación',
      id: 'fechadesactiva',
      value: moment().format('YYYY-MM-DD h:mm:ss'),
    },
    simestado: {
      label: 'Estado Sim',
      id: '',
      value: '',
    },
    motivos: {
      label: 'Motivos',
      id: '',
      value: '',
    },
  };

  mounted() {
    this.getEquipos();
  }
}
</script>
<style scoped>
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
}
.desplegable {
  border-radius: 0;
  z-index: 99999 !important;
}
</style>
