<template>
  <v-container v-show="show">
    <div style="max-height: 4px">
      <v-progress-linear
        indeterminate
        color="primary"
        v-show="cargando"
      ></v-progress-linear>
    </div>

    <div class="mx-3">
      <v-text-field
        name="busqueda"
        @input="onFilterTextBoxChanged"
        v-model="search"
        append-icon="search"
        label="Búsqueda."
        single-line
        hide-details
      ></v-text-field>
      <v-layout>
        <v-checkbox
          :label="`Solos Sin Transportista`"
          v-model="filtroNoAsignados"
          @change="handleCheckBox()"
        ></v-checkbox>
      </v-layout>
    </div>
    <v-divider></v-divider>
    <ag-grid-vue
      v-show="!cargando"
      style="width: auto; height: 200px"
      class="ag-theme-material"
      :columnDefs="columnDefs"
      :rowData="rowData"
      rowSelection="multiple"
      @row-selected="onRowSelected"
      @grid-ready="onGridReady"
    ></ag-grid-vue>
  </v-container>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { AgGridVue } from 'ag-grid-vue';
import { asociacionEventBus } from '@/setup';
import { Plataformas } from '@/interfaces/AsignacionTransportista/Plataformas';
import { fetchDashboard } from '@/pantallas/Dashboard/fetchDashboard';

import {
  fetchVehiculos,
  Vehiculo,
} from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';
@Component({
  components: {
    AgGridVue,
  },
})
export default class GridSeleccion extends Vue {
  show = false;
  $snotify: any;
  gridApi: any = null;
  columnApi: any = null;
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  filtroKey: number = null;
  codigoFiltroSeleccion: number = null;
  columnDefs: any[] = [];
  rowData: any[] = [];
  showData: any[] = [];
  rowSelection: any[] = [];
  dataFiltrada: any[] = [];
  dataFiltradaAsignada: any[] = [];
  data: any[] = [];
  snotify: any;
  elementoSeleccionado: number = null;
  search: string = '';
  intervalo: any;
  plataformaKey: number = null;
  Plataformas = new Plataformas();
  filtroNoAsignados: boolean = false;
  cargando: boolean = false;

  handleCheckBox() {
    if (this.dataFiltrada.length == 0) {
      this.dataFiltrada = this.data.filter(value => {
        return !value.rut_transportista;
      });
    }
    this.rowData = this.filtroNoAsignados ? this.dataFiltrada : this.data;
  }
  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.api;
  }

  mounted() {
    this.columnDefs = [
      {
        headerName: '',
        field: 'check',
        width: 70,
        minWidth: 70,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
      },
      {
        headerName: 'Nombre Transportista',
        field: 'nom_transportista',
        filter: 'agSetColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Rut Transportista',
        field: 'rut_transportista',
        filter: 'agSetColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Vehículo',
        field: 'vehiculo',
        filter: 'agSetColumnFilter',
        sortable: true,
      },
      { headerName: 'Flota', field: 'flota', sortable: true },
      { headerName: 'Grupo', field: 'grupo', sortable: true },
      { headerName: 'Codigo vehículo', field: 'cod_vehiculo', sortable: true },
      { headerName: 'Grupo', field: 'cod_grupovehiculo', sortable: true },
      { headerName: 'Plataforma', field: 'plataforma', sortable: true },
      { headerName: 'Codigo Flota', field: 'cod_flota', sortable: true },
      { headerName: 'Id ', field: 'id', sortable: true },
      { headerName: 'Mandante', field: 'mandante', sortable: true },
    ];
    asociacionEventBus.$on('resetBusqueda', (value: any) => {
      this.reset();
    });
    asociacionEventBus.$on(
      'EtiquetaFlotaSeleccion',
      (codFiltroSeleccion: any, plataforma: any, filtroKey: number) => {
        this.dataFiltrada = [];
        if (filtroKey != 2) this.show = true;
        this.filtroKey = filtroKey;
        this.cargando = true;
        this.plataformaKey = plataforma;
        this.codigoFiltroSeleccion = codFiltroSeleccion;
        codFiltroSeleccion
          ? this.getGrilla(codFiltroSeleccion, filtroKey, plataforma)
          : (this.rowData = []);
      }
    );
    asociacionEventBus.$on('resetGrilla', () => {
      this.reset();
    });
  }

  async validar() {
    let resultado: any;
    let selectedNodes = this.gridApi.getSelectedNodes();
    let selectedData = selectedNodes.map((node: any) => node.data);
    selectedData.length != 0 ? (resultado = true) : (resultado = false);
    asociacionEventBus.$emit('validacionComponente', resultado);
    return resultado;
  }
  async fetchDashboard(body: any, path: any) {
    let response = await fetchDashboard(body, path);
    return response;
  }
  async getGrilla(codFiltroSeleccion: any, filtroKey: number, plataforma: any) {
    this.elementoSeleccionado = codFiltroSeleccion;
    let patentes: any = [];
    let uri = 'mantenedor_transp_mandante/get_grilla';
    let body: any = {};
    let result = null;
    switch (filtroKey) {
      case 0:
        body = {
          plataforma: this.Plataformas.getNombrePorIdPlataformas(plataforma),
          cod_grupo: '',
          cod_flota: codFiltroSeleccion,
          patentes: patentes,
        };
        result = await fetchDashboard(body, uri);
        break;
      case 1:
        patentes = [];
        body = {
          plataforma: this.Plataformas.getNombrePorIdPlataformas(plataforma),
          cod_grupo: codFiltroSeleccion,
          cod_flota: '',
          patentes: patentes,
        };
        result = await fetchDashboard(body, uri);
        break;
    }
    result
      ? (result.data.CODIGO_RESPUESTA == 1
          ? ((this.rowData = result.data.data), (this.data = this.rowData))
          : (this.reset(),
            this.$snotify.error('Petición invalida'),
            asociacionEventBus.$emit('asignacionReady', false)),
        (this.cargando = false))
      : (this.$snotify.error('No existe retorno para esta selección'),
        asociacionEventBus.$emit('resetBusqueda', true));
  }

  getBody(
    codFiltroSeleccion: any,
    plataformaKey: number,
    filtroKey: number,
    data: any,
    checkAll = 'NO'
  ) {
    let patentes: any = [];
    let body: any = {};
    if (data) {
      data.map((row: any) => {
        patentes = [...patentes, row.cod_vehiculo];
      });
    }

    switch (filtroKey) {
      case 0:
        body = {
          plataforma: this.Plataformas.getNombrePorIdPlataformas(plataformaKey),
          cod_grupo: '',
          cod_flota: codFiltroSeleccion,
          cod_vehiculos: patentes,
          check_all: checkAll,
        };

        break;
      case 1:
        body = {
          plataforma: this.Plataformas.getNombrePorIdPlataformas(plataformaKey),
          cod_grupo: codFiltroSeleccion,
          cod_flota: '',
          cod_vehiculos: patentes,
          check_all: checkAll,
        };
        break;
    }
    return body;
  }
  onRowSelected(event: any) {
    let selectedNodes = this.gridApi.getSelectedNodes();
    let selectedData = selectedNodes.map((node: any) => node.data);
    let data;
    let dataNoAsociada;
    let body;
    let bodyAsignado;
    let patentes: any = [];
    let objetosVehiculoAsignado: any = [];
    let reset;
    let checkAll;

    selectedData.length != this.rowData.length
      ? (data = selectedData)
      : ((data = []), (checkAll = 'SI'));

    if (selectedData.length != 0) {
      this.dataFiltradaAsignada = selectedData.filter((value: any) => {
        return value.rut_transportista;
      });
    }
    selectedData.map((value: any) => {
      patentes = [...patentes, value.cod_vehiculo];
      if (value.id_asoc)
        objetosVehiculoAsignado = [
          ...objetosVehiculoAsignado,
          { vehiculo: value.cod_vehiculo, id_asoc: value.id_asoc },
        ];
    });

    reset = selectedData.length == 0;
    body = this.getBody(
      this.codigoFiltroSeleccion,
      this.plataformaKey,
      this.filtroKey,
      data,
      checkAll
    );
    asociacionEventBus.$emit(
      'seleccionPlataformaAsignacionVehiculo',
      body,
      this.dataFiltradaAsignada,
      reset,
      patentes,
      objetosVehiculoAsignado
    );
    let valido;
    selectedData.length != 0 ? (valido = true) : (valido = false);
    asociacionEventBus.$emit('validacionComponente', valido);
  }

  onFilterTextBoxChanged() {
    if (this.search === null) this.search = '';
    this.gridApi.setQuickFilter(this.search.length > 1 ? this.search : '');
  }
  reset() {
    this.rowData = [];
    this.search = null;
    this.show = false;
  }
}
</script>
