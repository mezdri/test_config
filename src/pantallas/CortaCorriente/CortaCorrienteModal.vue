<template>
  <v-dialog
    v-model="show"
    persistent
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    class="vDialogClass"
  >
    <v-card style="position: fixed;overflow: auto;">
      <CabeceraModal :titulo="title" @cerrar="handleCerrar">
        <GuardarButton
          v-if="!(selectedAction == 'detail')"
          @click="handleSave"
          :disabled="disabledSave"
        />
      </CabeceraModal>
      <v-card height="55px" flat style="">
        <div id="formDiv">
          <v-card class="rounded-card" style="margin: 25px 25px 0px 25px;">
            <v-container
              grid-list-md
              style="padding: 10px !important; padding-bottom: 0px !important;"
            >
              <FormFieldsContainer titulo="Tipo Corta Corriente">
                <v-flex xs3 md3 lg3>
                  <v-radio-group
                    v-model="radioValue"
                    row
                    :disabled="selectedAction == 'detail'"
                  >
                    <v-radio
                      label="Entrada Sitio"
                      value="entrada_sitio"
                    ></v-radio>
                    <v-radio
                      label="Salida Sitio"
                      value="salida_sitio"
                    ></v-radio>
                  </v-radio-group>
                </v-flex>
              </FormFieldsContainer>
            </v-container>

            <div style="display: flex; align-items: flex-start;">
              <v-container
                grid-list-md
                style="padding-top: 0px !important; flex-basis: 40%; margin: 0px !important"
              >
                <FormFieldsContainer titulo="Sitio" style="width: 100%;">
                  <v-card style="width: 100%; ">
                    <v-text-field
                      style="margin-left: 1%; height: max-content;"
                      v-model="searchInputSites"
                      @input="searchData('sites')"
                      label="Buscar..."
                    ></v-text-field>
                    <GridComponent
                      id="gridComponentSites"
                      ref="gridComponent1"
                      class="ag-theme-material"
                      :gridOptions="gridOptionsSites"
                    ></GridComponent>
                  </v-card>
                </FormFieldsContainer>
              </v-container>
              <v-container
                grid-list-md
                style=" padding-top: 0px !important;flex-basis: 60%; margin: 0px !important"
              >
                <FormFieldsContainer titulo="Vehículo(s)" style="width: 100%;">
                  <v-card style="width: 100%; ">
                    <v-text-field
                      style="margin-left: 1%; height: max-content;"
                      v-model="searchInputVehicles"
                      @input="searchData('vehicles')"
                      label="Buscar..."
                    ></v-text-field>
                    <GridComponent
                      id="gridComponentVehicles"
                      ref="gridComponent2"
                      class="ag-theme-material"
                      :gridOptions="gridOptionsVehicles"
                    ></GridComponent>
                  </v-card>
                </FormFieldsContainer>
              </v-container>
            </div>
          </v-card>
        </div>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
const { AgGridVue } = require('ag-grid-vue');
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CabeceraModal from '@/reusable/Modal/CabeceraModal.vue';
import ModalMantenedor from '@/reusable/Modal/ModalMantenedor.vue';
import { LoadingService } from '@/services/loadingService';
import { Snotify } from '@/snotify/Snotify';
import FormFieldsContainer from '@/reusable/Form/FormFieldsContainer.vue';
import GuardarButton from '@/reusable/Modal/GuardarButton.vue';
import { differenceBy, uniqBy } from 'lodash';
import {
  GridOptions,
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  RowNode,
  CellContextMenuEvent,
  ICellRendererParams,
} from 'ag-grid-community';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

@Component({
  components: {
    CabeceraModal,
    ModalMantenedor,
    GridComponent: AgGridVue,
    FormFieldsContainer,
    GuardarButton,
  },
})
export default class CortaCorrienteModal extends Vue {
  @Prop({ default: true }) show: boolean;
  @Prop({ default: '' }) selectedAction: string;
  @Prop({ default: {} }) loadData: any;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Metabase);
  readonly urlPg: string = 'Metabase/PostgenericA/track_corta_corriente/';
  title: string = '';
  isFormValid: boolean = true;
  disabledSave: boolean = false;
  searchInputSites: string = '';
  searchInputVehicles: string = '';
  pasoActivoIndex = 1;
  pasos = {
    informacionGeneral: {
      accion: 'Crear - Información General',
      visible: true,
      step: 1,
    },
  };
  radioValue: string = 'entrada_sitio';
  showInfo: boolean = false;
  localeText: any = {};
  gridOptionsSites: GridOptions;
  gridApiSites: GridApi;
  sitesList: any[] = [];
  columnApiSites: ColumnApi;
  gridOptionsVehicles: GridOptions;
  gridApiVehicles: GridApi;
  vehiclesList: any[] = [];
  columnApiVehicles: ColumnApi;
  checkColumnSites: ColDef = {
    headerName: '',
    field: 'checked',
    width: 70,
    maxWidth: 70,
    minWidth: 70,
    pinned: 'left',
    checkboxSelection: true,
    headerCheckboxSelection: false,
    headerCheckboxSelectionFilteredOnly: false,
    suppressMenu: true,
    resizable: false,
    sortable: true,
    filter: false,
    suppressMovable: true,
    lockVisible: true,
    cellRenderer: (r: any) => {
      if (r.data.checked !== undefined) {
        return r.node.setSelected(r.data.checked);
      }
    },
  };
  checkColumnVehicles: ColDef = {
    headerName: '',
    field: 'checked',
    width: 70,
    maxWidth: 70,
    minWidth: 70,
    pinned: 'left',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    suppressMenu: true,
    resizable: false,
    sortable: true,
    sort: 'desc',
    filter: false,
    suppressMovable: true,
    lockVisible: true,
    cellStyle: { textAlign: 'left' },
    cellRenderer: (r: any) => {
      if (r.data.checked !== undefined) {
        return r.node.setSelected(r.data.checked);
      }
    },
  };
  columnDefsSites: Array<ColDef> = [
    {
      headerName: 'id',
      field: 'id',
      sortable: true,
      resizable: true,
      lockPinned: true,
      hide: true,
    },
    {
      headerName: 'Nombre',
      field: 'nombresitio',
      sortable: true,
      resizable: true,
      lockPinned: true,
    },
    {
      headerName: 'Grupo',
      field: 'nombregrupo',
      sortable: true,
      resizable: true,
      lockPinned: true,
    },
  ];
  columnDefsVehicles: Array<ColDef> = [
    {
      headerName: 'id',
      field: 'id',
      sortable: true,
      resizable: true,
      lockPinned: true,
      hide: true,
    },
    {
      headerName: 'Patente',
      field: 'unidad',
      sortable: true,
      resizable: true,
      lockPinned: true,
    },
    {
      headerName: 'Flotas',
      field: 'flota',
      sortable: true,
      resizable: true,
      lockPinned: true,
    },
    {
      headerName: 'Etiquetas',
      field: 'etiqueta',
      sortable: true,
      resizable: true,
      lockPinned: true,
    },
    {
      headerName: 'Marca Gps',
      field: 'nom_marca',
      sortable: true,
      resizable: true,
      lockPinned: true,
    },
    {
      headerName: 'Modelo Gps',
      field: 'nom_modelo',
      sortable: true,
      resizable: true,
      lockPinned: true,
    },
  ];

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  /* event handlers */

  constructor() {
    super();

    this.gridOptionsSites = {
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      onGridSizeChanged: event => {
        event.api.sizeColumnsToFit();
      },
      suppressRowClickSelection: true,
      suppressCellSelection: false,
      localeText: this.localeText,
      onGridReady: this.onGridReadySites,
      columnDefs: this.columnDefsSites,
      suppressCopyRowsToClipboard: true,
      isExternalFilterPresent: () => {
        return true;
      },
      doesExternalFilterPass: () => {
        return true;
      },
      overlayNoRowsTemplate: 'No hay filas para mostrar',
      blockLoadDebounceMillis: 350,
      columnTypes: {},
      suppressCsvExport: false,
      suppressExcelExport: true,
    };
    this.gridOptionsVehicles = {
      rowSelection: 'multiple',
      pagination: true,
      paginationPageSize: 5, //Solución Paginación
      cacheBlockSize: 10000, //Solución Paginación //Ordenamiento + Seleccion
      paginationAutoPageSize: false,
      rowMultiSelectWithClick: false,
      onGridSizeChanged: event => {
        event.api.sizeColumnsToFit();
      },
      suppressRowClickSelection: true,
      localeText: this.localeText,
      onGridReady: this.onGridReadyVehicles,
      columnDefs: this.columnDefsVehicles,
      onRowSelected(event) {
        if (event.node.isSelected()) {
          event.data.checked = true;
        } else {
          event.data.checked = false;
        }
      },
      suppressCopyRowsToClipboard: true,
      isExternalFilterPresent: () => {
        return true;
      },
      doesExternalFilterPass: () => {
        return true;
      },
      overlayNoRowsTemplate: 'No hay filas para mostrar',
      blockLoadDebounceMillis: 350,
      columnTypes: {},
      suppressCsvExport: false,
      suppressExcelExport: true,
    };
  }

  searchData(type: string) {
    if (type == 'sites') {
      this.gridApiSites.setQuickFilter(this.searchInputSites);
      this.gridApiSites.setDomLayout('autoHeight');
    } else {
      this.gridApiVehicles.setQuickFilter(this.searchInputVehicles);
      this.gridApiVehicles.setDomLayout('autoHeight');
    }
  }

  async onGridReadySites(params: GridReadyEvent) {
    this.gridApiSites = params.api;
    this.columnApiSites = params.columnApi;
    this.gridApiSites.setRowData([]);
    this.gridApiSites.setDomLayout('autoHeight');
  }

  async onGridReadyVehicles(params: GridReadyEvent) {
    this.gridApiVehicles = params.api;
    this.columnApiVehicles = params.columnApi;
    this.gridApiVehicles.setRowData([]);
    this.gridApiVehicles.setDomLayout('autoHeight');
  }

  onHeaderCheckboxClicked(params: any) {
    console.log(params);
  }

  async mounted() {
    this.getSites();
    this.getVehicles();
  }

  handleSave() {
    if (
      this.gridApiSites.getSelectedRows().length == 0 ||
      this.gridApiVehicles.getSelectedRows().length == 0
    ) {
      this.$snotify.error('Debe Seleccionar Al Menos 1 Sitio y 1 Vehículo', {
        timeout: 3000,
      });
      return;
    }
    const service: string =
      this.selectedAction == 'create'
        ? 'post_corta_corriente'
        : 'put_corta_corriente';
    this.loadingService.showLoading();
    let body: any = {
      clienteid: this.getClientID(),
      usuarioid: this.getUserID(),
      //usuarioid: 408,
      tipo:
        this.radioValue == 'entrada_sitio' ? 'Entrada Sitio' : 'Salida Sitio',
      jsitio: this.gridApiSites.getSelectedRows().map((data: any) => {
        try {
          return parseInt(data.id);
        } catch (error) {
          console.error(error);
          return data.id;
        }
      }),
      jvehiculo: this.gridApiVehicles.getSelectedRows().map((data: any) => {
        try {
          return parseInt(data.id);
        } catch (error) {
          console.error(error);
          return data.id;
        }
      }),
      jtag: [],
      idcortacorriente: this.loadData.hasOwnProperty('id')
        ? this.loadData.id
        : '0',
    };
    this.axios.http
      .post(`${this.urlPg}${service}`, body)
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          this.$snotify.success(response.data.msg, {
            timeout: 3000,
          });
          this.handleCerrar();
        } else {
          this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
            timeout: 3000,
          });
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al Actualizar El Corta Corriente');
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  async getVehicles() {
    this.loadingService.showLoading();
    let body: any = {
      clienteid: this.getClientID(),
      usuarioid: this.getUserID(),
      //usuarioid: 408,
    };
    this.axios.http
      .post(`${this.urlPg}get_vehiculo_cliente_usuario`, body)
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          this.vehiclesList = response.data.data;
          this.gridApiVehicles.setRowData(response.data.data);
        } else {
          this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
            timeout: 3000,
          });
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al Obtener los Vehículos');
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  async getSites() {
    this.loadingService.showLoading();
    let body: any = {
      clienteid: this.getClientID(),
    };
    this.axios.http
      .post(`${this.urlPg}get_sitio_cliente`, body)
      .then((response: any) => {
        if (response.data.CODIGO_RESPUESTA == '1') {
          this.sitesList = response.data.data;
          this.gridApiSites.setRowData(response.data.data);
        } else {
          this.$snotify.error(response.data.MENSAJE_RESPUESTA, {
            timeout: 3000,
          });
        }
      })
      .catch((error: any) => {
        console.log(error);
        this.$snotify.error('Error al Obtener los Sitios');
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  handleCerrar() {
    this.$emit('closeModal');
    this.clear();
  }

  filterDetail(val: boolean) {
    console.log(val);
    if (val) {
      let sites = this.sitesList.filter((data: any) =>
        this.loadData.jsitio.includes(parseInt(data.id))
      );
      let vehicles = this.vehiclesList.filter((data: any) =>
        this.loadData.jvehiculo.includes(parseInt(data.id))
      );
      this.gridApiSites.setRowData(sites);
      this.gridApiVehicles.setRowData(vehicles);
    } else {
      this.gridApiSites.setRowData(this.sitesList);
      this.gridApiVehicles.setRowData(this.vehiclesList);
    }
  }

  @Watch('show', { immediate: true })
  async onSelectedAction(value: boolean, oldValue: boolean) {
    if (value) {
      this.clear();
      // await this.getSites();
      // await this.getVehicles();
      switch (this.selectedAction) {
        case 'edit':
          this.gridApiSites.setColumnDefs([
            this.checkColumnSites,
            ...this.columnDefsSites,
          ]);
          this.gridApiVehicles.setColumnDefs([
            this.checkColumnVehicles,
            ...this.columnDefsVehicles,
          ]);
          this.filterDetail(false);
          this.handleLoadData();
          this.title = 'Editar Corta Corriente';
          break;
        case 'detail':
          this.gridApiSites.setColumnDefs(this.columnDefsSites);
          this.gridApiVehicles.setColumnDefs(this.columnDefsVehicles);
          this.handleLoadData();
          this.filterDetail(true);
          this.title = 'Detalle Corta Corriente';
          break;
        case 'create':
          this.gridApiSites.setColumnDefs([
            this.checkColumnSites,
            ...this.columnDefsSites,
          ]);
          this.gridApiVehicles.setColumnDefs([
            this.checkColumnVehicles,
            ...this.columnDefsVehicles,
          ]);
          this.title = 'Crear Corta Corriente';
          break;
      }
    }
  }

  clear() {
    this.radioValue = 'entrada_sitio';
    this.gridApiSites.deselectAll();
    this.gridApiSites.forEachNode((row: RowNode) => {
      row.data.checked = false;
    });
    this.gridApiSites.setRowData(this.sitesList);
    this.gridApiSites.paginationGoToPage(0);
    this.gridApiVehicles.deselectAll();
    this.gridApiVehicles.forEachNode((row: RowNode) => {
      row.data.checked = false;
    });
    this.gridApiVehicles.setRowData(this.vehiclesList);
    this.gridApiVehicles.paginationGoToPage(0);
  }

  handleLoadData() {
    const sites: Set<any> = new Set(this.loadData.jsitio);
    let indexSites: any[] = [];
    const vehicles: Set<any> = new Set(this.loadData.jvehiculo);
    let indexVehicles: any[] = [];
    this.radioValue =
      this.loadData.tipo == 'Entrada Sitio' ? 'entrada_sitio' : 'salida_sitio';
    this.gridApiSites.forEachNode((node: any) => {
      let id = node.data.id;
      if (sites.has(parseInt(id))) {
        node.data.checked = true;
        node.setSelected(true);
        indexSites.push(node.rowIndex);
      }
    });
    this.gridApiVehicles.forEachNode((node: any) => {
      let id = node.data.id;
      if (vehicles.has(parseInt(id))) {
        node.data.checked = true;
        node.setSelected(true);
        indexVehicles.push(node.rowIndex);
      }
    });

    // Ordenar grilla vehículos por los seleccionados
    let selectedRowData: any[] = [];
    let unselectedRowData: any[] = [];
    const vehiculosSeleccionados = this.gridApiVehicles
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const vehiculosNoSeleccionados = differenceBy(
      this.vehiclesList,
      vehiculosSeleccionados,
      veh => veh.id
    ).map(veh => ({
      ...veh,
      checked: false,
    }));

    this.gridApiVehicles.updateRowData({
      update: [...vehiculosNoSeleccionados, ...vehiculosSeleccionados],
    });
    // Ordenar grilla sitios  por los seleccionados
    let selectedRowData2: any[] = [];
    let unselectedRowData2: any[] = [];
    this.gridApiSites.forEachNode((row: RowNode) => {
      if (row.isSelected()) {
        row.data.checked = true;
        selectedRowData2.push(row.data);
      } else {
        row.data.checked = false;
        unselectedRowData2.push(row.data);
      }
    });
    this.gridApiSites.setRowData([...selectedRowData2, ...unselectedRowData2]);
  }

  handleInfoGeneral() {
    this.showInfo = true;
  }
  getUserID(): any {
    let user = localStorage.getItem('user');
    let id = JSON.parse(user.replace(/'/g, '"')).id;
    return id;
  }

  getClientID(): number {
    return parseInt(localStorage.getItem('clienteDefecto'));
    // return 5216;
  }
}
</script>
<style scoped>
#formDiv {
  /* min-height: calc(100vh - 120px); */
}
.cardTitleClass {
  font-weight: 500 !important;
  font-size: 20px !important;
  padding-bottom: 5px !important;
}
.vDialogClass {
  background-color: #fff !important;
}
</style>
