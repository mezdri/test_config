<template>
  <div class="configurar-Servipag">
    <FormFieldsContainer>
      <v-flex sm2 md2>
        <DatePicker
          :label="formFields.fechaInicio.label"
          :error-messages="errors.collect(formFields.fechaInicio.id)"
          :id="formFields.fechaInicio.id"
          v-model="formFields.fechaInicio.value"
        />
      </v-flex>
      <v-flex sm2 md2>
        <DatePicker
          :label="formFields.fechaFinal.label"
          :error-messages="errors.collect(formFields.fechaFinal.id)"
          :id="formFields.fechaFinal.id"
          v-model="formFields.fechaFinal.value"
        />
      </v-flex>

      <v-flex sm2 md2>
        <v-text-field
          v-model="formFields.folio.value"
          :label="formFields.folio.label"
          type="number"
          required
        />
        <!--v-text-field  el usuario ingrese manualmente el dato  -->
      </v-flex>

      <!-- casilla Estado Pago -->
      <v-flex sm2 md2>
        <v-autocomplete
          v-model="formFields.Estado.value"
          :label="formFields.Estado.label"
          :items="estadoLista"
          item-text="estado"
          item-value="estado"
        />
      </v-flex>

      <!-- Creando boto para filtrar y limpiar -->

      <v-flex sm1 md1>
        <v-btn @click="handleBuscarClick">
          <v-icon>search</v-icon>Filtrar
        </v-btn>
      </v-flex>
      <v-flex sm1 md1>
        <v-btn @click="clearFilters"> <v-icon>clear</v-icon>Limpiar </v-btn>
      </v-flex>

      <v-flex sm1 md1>
        <div aling="right" style="">
          <v-btn flat small color="primary" @click="exportFile()">
            <v-icon class="importExportBtnIcon">cloud_download</v-icon
            >&nbsp;&nbsp;
            <span class="importExportBtnTexto">Exportar CSV</span>
          </v-btn>
        </div>
      </v-flex>

      <v-flex sm12 md12 ridcard rounded-card>
        <MantenedorGrid
          :grid-options="gridOptions"
          :funcionalidad-id="funcionalidad"
        />
      </v-flex>
    </FormFieldsContainer>
  </div>
</template>
<script lang="ts">
//codificamos en ts

//importando clases
import { fetchReportesSerie } from '@/pantallas/Conecta/MantenedorServipag/fetchReporteSerie';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import DatePicker from '@/reusable/Form/DatePicker.vue';
import moment from 'moment';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import { Component } from 'vue-property-decorator';
import { utils, writeFileXLSX } from 'xlsx';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import {
  FormFieldDefMap,
  emitFormChangeEvent,
} from '@/reusable/Form/formUtils'; //plantilla
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccion } from '@/views/base/VariablesPermisos';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  DragStoppedEvent,
  ColumnVisibleEvent,
  ColumnPinnedEvent,
  ProcessCellForExportParams,
  CsvExportParams,
  ValueFormatterParams,
  ICellRendererParams,
  GetQuickFilterTextParams,
} from 'ag-grid-community';
import { RichSelectCellEditor } from 'ag-grid-enterprise';
import {
  dowloadDocs,
  fetchDte,
  Factura,
  MsResponseData,
  parseFactura,
} from '@/pantallas/SucursalVirtual/VerFacturacion/fetchDte';

@Component({
  components: {
    MantenedorGrid,
    DatePicker, //funcion que ocupamos y llammos arriba
    FormFieldsContainer, //funcion que llamamos y ocupamos arriba
    //FiltrosBusqueda,
  },
})
export default class ConfigurarPantallaServipag extends ComponenteBase {
  //llamamos a una clase para trabajar aqui dentro
  readonly funcionalidad: Funcionalidades = Funcionalidades.MantenedorServipag;
  accionesTotales: PermisoAccion[];
  ordesList: any[] = [];
  estadoLista: any[] = [];
  configurarServipag: any[] = null;
  serverSide: any;

  //funcion para fechas
  get fechaMaxima() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    let fechaMax = yyyy + '-' + mm + '-' + dd;
    return fechaMax;
  }
  get fechaMaximaInicio() {
    return moment(this.fechaMaxima) as moment.Moment;
    //return fechaMax as moment.Moment;
  }
  //funcion limpiar
  async clearFilters() {
    this.formFields.fechaInicio.value = moment(this.fechaMaxima);
    this.formFields.fechaFinal.value = moment(this.fechaMaxima + 1);
    this.formFields.folio.value = '';
    this.formFields.Estado.value = '';
    this.$emit('clear');
    this.ordesList = await this.getReportes();
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.get_grilla_filter();
  }

  //funcion buscar
  async handleBuscarClick() {
    const resultadoValidacion = await this.$validator.validateAll();
    console.log(
      'Esta es la fecha de inicio ',
      this.formFields.fechaInicio.value,
      'Esta es la fecha final ',
      this.formFields.fechaFinal.value,
      'Este es el folio ',
      this.formFields.folio.value,
      'Este es el estado ',
      this.formFields.Estado.value
    );
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      {
        folio: this.formFields.folio.value,
        estado: this.formFields.Estado.value,
        fechaInicio: this.formFields.fechaInicio.value,
        fechaFinal: this.formFields.fechaFinal.value,
      },
      'MantenedorServipag/get_filtered_rs'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.estadoLista = data.data.EQUIPOS; //self remplaza el this
          this.ordesList = data.data.data.LISTA;
          this.get_grilla_filter();
          this.gridApi.setRowData(this.ordesList); //funcion que carga la grilla
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          this.ordesList = []; //vacia la grilla le pasamos lista vacia
          this.gridApi.setRowData(this.ordesList); //vacia la grilla llena la grilla con lista vacia
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

  async get_grilla_filter() {
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie(
      { '': '' },
      'MantenedorServipag/get_grilla_filters'
    )
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.estadoLista = data.data.EQUIPOS; //self remplaza el this
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

  //creamos form fields y ademas podemos personalizar las casillas en la interfaz para luego llamarlas arriba
  formFields: FormFieldDefMap = {
    folio: {
      label: 'Folio', //etiqueta de la casilla
      id: '',
      value: '',
    },
    Estado: {
      label: 'Estado Pago', //etiqueta de la casilla
      id: '',
      value: '',
    },
    fechaInicio: {
      label: 'Fecha Inicio',
      id: 'fechaInicio',
      value: moment().subtract(1, 'month'),
    },
    fechaFinal: { label: 'Fecha Final', id: 'fechaFin', value: moment() },
  };
  async getReportes() {
    //funcion cargamos grilla
    let self = this;
    this.loadingService.showLoading();
    return fetchReportesSerie({ '': '' }, 'MantenedorServipag')
      .then((data: any) => {
        if (data.data.CODIGO_RESPUESTA == '1') {
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
  //grid (tabla)
  gridApi: GridApi = null;
  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Rut Cliente',
        field: 'rutcliente',
        cellStyle: { textAlign: 'left' },
        width: 350,
      },
      {
        headerName: 'Rut Usuario',
        field: 'rutusuario',
        cellStyle: { textAlign: 'left' },
        width: 350,
      },
      {
        headerName: 'Email Usuario',
        field: 'mail_usuario',
        cellStyle: { textAlign: 'left' },
        width: 350,
      },
      {
        headerName: 'Folio',
        field: 'folio',
        cellStyle: { textAlign: 'left' },
        width: 350,
      },
      {
        headerName: 'Monto',
        field: 'monto',
        cellStyle: { textAlign: 'left' },
        width: 350,
      },
      {
        headerName: 'Estado Pago',
        field: 'estado',
        cellStyle: { textAlign: 'left' },
        width: 350,
      },
      {
        headerName: 'Fecha',
        field: 'fecha',
        cellStyle: { textAlign: 'left' },
        width: 350,
        valueFormatter: function(params) {
          return moment(params.value).format('YYYY-MM-DD' + ' HH:mm:ss');
        },
      },
    ],

    pagination: true,
    paginationPageSize: 25,
    onGridReady: this.handleGridReady,
  };

  async handleGridReady(event: GridReadyEvent) {
    this.ordesList = await this.getReportes();
    this.gridApi = event.api;
    console.log(this.ordesList);
    this.gridApi.setRowData(this.ordesList);
    this.gridApi.setDomLayout('autoHeight');
    this.get_grilla_filter();
  }

  exportFile() {
    if (this.ordesList.length < 1) {
      this.$snotify.warning('No existen datos para exportar.');
    } else {
      if (Object.keys(this.ordesList).length == 1) {
        delete this.ordesList[0].STATUS;
        delete this.ordesList[0].TOTAL_REGISTROS;
        delete this.ordesList[0].LISTA;
      }

      const ws = utils.json_to_sheet(this.ordesList);
      ws['A1'].v = 'Rut Cliente'; //ws filas
      ws['B1'].v = 'Rut Usuario';
      ws['C1'].v = 'Mail Usuario';
      ws['D1'].v = 'Folio';
      ws['E1'].v = 'Monto';
      ws['F1'].v = 'Estado';
      ws['G1'].v = 'Fecha';

      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Data');
      writeFileXLSX(wb, 'ReportesServipag.xlsx');
      this.$snotify.success(
        this.$t('mensajes.mensajesExito.exportar').toString()
      );
    }
  }
}
</script>
<style>
.configurar-Servipag .estilo-grilla,
#gridComponent {
  height: auto !important;
  margin-bottom: 50px;
}
</style>
