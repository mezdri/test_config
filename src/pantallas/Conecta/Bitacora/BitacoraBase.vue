<template>
  <div class="resportesserie">
    <div class="flex sm12 md12">
      <FormFieldsContainer>
        <v-flex sm12 md12 layout wrap>
          <v-flex sm12 md12 layout wrap>
            <v-flex sm2 md2 v-if="permiso == 'Root'">
              <v-autocomplete
                v-model="formFields.usuario.value"
                :label="formFields.usuario.label"
                :items="usuariolist"
                item-text="username"
                item-value="id"
                clearable
                required
              />
            </v-flex>
            <v-flex sm2 md2>
              <v-autocomplete
                v-model="formFields.cliente.value"
                :label="formFields.cliente.label"
                :items="clientelist"
                item-text="nombre"
                item-value="id"
                clearable
              />
            </v-flex>
            <v-flex sm2 md2>
              <DatePicker
                :label="formFields.fechaInicio.label"
                :error-messages="errors.collect(formFields.fechaInicio.id)"
                :id="formFields.fechaInicio.id"
                v-model="formFields.fechaInicio.value"
                :max="fechaMaximaInicio.format('YYYY-MM-DD')"
              />
            </v-flex>
            <v-flex sm2 md2>
              <DatePicker
                :label="formFields.fechaFin.label"
                :error-messages="errors.collect(formFields.fechaFin.id)"
                :id="formFields.fechaFin.id"
                v-model="formFields.fechaFin.value"
                :max="fechaMaximaInicio.format('YYYY-MM-DD')"
              />
            </v-flex>

            <v-flex sm2 md2>
              <v-autocomplete
                v-model="formFields.modulo.value"
                :label="formFields.modulo.label"
                :items="modulolist"
                item-text="bmodulo"
                item-value="bmoduloid"
                clearable
              />
            </v-flex>

            <v-flex sm2 md2>
              <div class="text-sm-center botones-filtros">
                <v-btn @click="handleBuscarClick">
                  <v-icon>search</v-icon>Filtrar
                </v-btn>
                <v-btn @click="clearFilters">
                  <v-icon>clear</v-icon>Limpiar
                </v-btn>
              </div>
            </v-flex>
          </v-flex>
        </v-flex>
        <div class="clearfix" style="width:100%"></div>
      </FormFieldsContainer>
    </div>

    <div class="gridcard rounded-card">
      <MantenedorGrid
        :grid-options="gridOptions"
        :funcionalidadId="funcionalidad"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import FiltrosBusqueda from '@/pantallas/Camaras/Alertas/FiltrosBusqueda.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import { Funcionalidades } from '@/config/funcionalidades';
const { AgGridVue } = require('ag-grid-vue');
import { GridOptions, GridApi, GridReadyEvent } from 'ag-grid-community';
import { LoadingService } from '@/services/loadingService';
import { ComponenteBase } from '@/views/base/ComponenteBase';
import moment from 'moment';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { fetchReportesSerie } from './fetchReporteSerie';
import { FormFieldDefMap } from '@/reusable/Form/formUtils';
import { PermisoAccion } from '@/views/base/VariablesPermisos';

@Component({
  components: {
    MantenedorGrid,
    GridComponent: AgGridVue,
    FiltrosBusqueda,
    FormFieldsContainer,
    DatePicker,
  },
})
export default class BitacoraBase extends ComponenteBase {
  readonly funcionalidad: Funcionalidades = Funcionalidades.Bitacora;
  permiso: any = JSON.parse(localStorage.getItem('user')).permisosUsuario[0]
    .nombrePerfil;
  loadingService = new LoadingService();
  filtrobusquedagrilla: string = '';
  filtro: any;
  pagina: number = 1;
  columnApi: any = null;
  serverSide: any;
  gridApi: GridApi = null;

  ordesList: any[] = [];
  clientelist: any[] = [];
  modulolist: any[] = [];
  usuariolist: any = [];
  usuarioID: any = '';
  total_registros: number = 0;
  cant_regs_pag: number = 25;

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Usuario Acción',
        field: 'username',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 140,
      },
      {
        headerName: 'Usuario RUT ',
        field: 'usuariorut',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Cliente',
        field: 'nombre',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
      {
        headerName: 'Fecha',
        field: 'bfecha',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
        valueFormatter: function(params) {
          if (params.value) {
            return moment(params.value).format('YYYY-MM-DD HH:mm:ss');
          }
        },
      },
      {
        headerName: 'Módulo',
        field: 'bmodulo',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Tabla',
        field: 'btabla',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Acción',
        field: 'baccion',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Descripción',
        field: 'bdescripcion',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 215,
      },
      {
        headerName: 'Modulo ID',
        field: 'bmoduloid',
        cellStyle: { textAlign: 'left' },
        resizable: true,
        width: 135,
      },
    ],

    pagination: true,
    paginationPageSize: 25,
    onGridReady: this.handleGridReady,
  };
  async handleGridReady(event: GridReadyEvent) {
    this.usuarioID = JSON.parse(localStorage.getItem('user')).id;
    this.ordesList = await this.getReportes(this.usuarioID);
    this.gridApi = event.api;
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.getEquipos();
    this.clearFilters();
  }
  async getEquipos() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie({ '': '' }, 'conecta_bitacora/get_grilla_filters')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.usuariolist = data.data.USUARIO;
          self.clientelist = data.data.CLIENTE;
          self.modulolist = data.data.MODULO;
          console.log(data.data);
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
  async getReportes(usuarioID: any) {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie({ usuarioID: usuarioID }, 'conecta_bitacora')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          console.log(data.data.data.LISTA);
          return data.data.data.LISTA;
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
    usuario: {
      label: 'Usuario Acción',
      id: 'tipoubicaid',
      value: 'tipoubicaname',
    },
    fechaInicio: {
      label: 'Fecha Inicio',
      id: 'fechaInicio',
      value: moment().subtract(1, 'month'),
    },
    fechaFin: {
      label: 'Fecha Fin',
      id: 'fechaFin',
      value: moment(),
    },
    cliente: {
      label: 'Cliente',
      id: 'asigcrm_flota',
      value: 'asigcrm_flota',
    },
    modulo: {
      label: 'Módulo',
      id: 'asigcrm_rutcli',
      value: 'asigcrm_rutcli',
    },
  };

  autoSizeAll(skipHeader: boolean) {
    this.columnApi.autoSizeColumns(
      this.columnApi.getAllDisplayedColumns().map((x: any) => x.colId)
    );
  }
  handleBuscarClick() {
    this.filtroRequerimiento(true);
  }

  get fechaMaxima() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    let fechaMax = yyyy + '-' + mm + '-' + dd;
    return fechaMax;
  }
  get fechaMinimaInicio() {
    let fechaIni = this.formFields.fechaInicio.value;
    return fechaIni as moment.Moment;
  }
  get fechaMinima() {
    let fechaMin = moment(new Date())
      .add(-12, 'months')
      .toISOString()
      .substr(0, 10);
    return fechaMin;
  }
  get fechaMaximaInicio() {
    //let fechaMax = this.formFields.fechaInicio.value;

    return moment(this.fechaMaxima) as moment.Moment;
    //return fechaMax as moment.Moment;
  }
  async clearFilters() {
    this.formFields.usuario.value = undefined;
    this.formFields.cliente.value = undefined;
    this.formFields.modulo.value = undefined;
    this.ordesList = await this.getReportes(this.usuarioID);
    this.gridApi.setRowData(this.ordesList);
    this.getEquipos();
  }

  //evita el click derecho
  handlerContexTmenu(e: any) {
    e.preventDefault();
  }

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };
  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionExportar,
  ];

  filtroRequerimiento(loadWidget: boolean) {
    this.gridApi.setServerSideDatasource(this.serverSide);
    if (loadWidget) {
      this.buscarRequerimientosWidgets();
    }
  }
  async buscarRequerimientosWidgets() {
    let response: any = (await this.fetchRequermientosWidgets()) || null;
    if (response !== null) {
      if (response.data.CODIGO_RESPUESTA == '1') {
        if (response.data.data.length === 0) {
          this.ordesList = [];
        } else {
          this.ordesList = response;
        }
      } else {
        this.ordesList = [];
        this.$snotify.error(response.data.MENSAJE_RESPUESTA, { timeout: 3000 });
      }
    }
  }
  async fetchRequermientosWidgets() {
    let body: any = this.filtros2body();
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      {
        USUARIO: body.usuario,
        CLIENTE: body.cliente,
        MODULO: body.modulo,
        dateStart: self.formFields.fechaInicio.value,
        dateEnd: self.formFields.fechaFin.value,
      },
      'conecta_bitacora/get_filtered_rs'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          this.gridApi.setRowData(data.data.data.LISTA);
          return data.data.data.LISTA;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.gridApi.setRowData((this.ordesList = []));
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
  filtros2body() {
    let body: any = {};
    body.usuario = this.formFields.usuario.value
      ? this.formFields.usuario.value
      : '';
    body.cliente = this.formFields.cliente.value
      ? this.formFields.cliente.value
      : '';
    body.modulo = this.formFields.modulo.value
      ? this.formFields.modulo.value
      : '';
    return body;
  }
}
</script>
<style scope>
.reportesSerieActiva
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(1)
  > div:nth-child(1) {
  display: none;
}
.reportesSerieActiva div.ag-layout-auto-height:nth-child(3) > div:nth-child(1) {
  display: none;
}
.reportesSerieActiva
  div.ag-layout-auto-height:nth-child(2)
  > div:nth-child(1)
  > div:nth-child(5)
  > div:nth-child(1) {
  display: none;
}
.resportesserie .estilo-grilla,
#gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}
</style>
