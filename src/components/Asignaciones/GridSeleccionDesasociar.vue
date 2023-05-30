<template>
  <v-container>
    <v-container grid-list-xs v-show="showFiltroAsociado">
      <v-card
        class="pa-3 d-flex align-center"
        justify-center
        color="#27488E"
        dark
        icon="$mdiVuetify"
      >
        Esta asociada con transportista mediante la selección de
        {{ this.Plataformas.getNombrePorIdFiltros(this.filtroKey) }} , al
        momento de desasociar se eliminara este registro.
      </v-card>
    </v-container>
    <v-container grid-list-xs v-show="!showFiltroAsociado">
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
      </div>
      <v-divider></v-divider>
      <ag-grid-vue
        style="width: auto; height: 200px"
        class="ag-theme-material"
        :columnDefs="columnDefs"
        :rowData="rowData"
        rowSelection="multiple"
        @row-selected="onRowSelected"
        @grid-ready="onGridReady"
      ></ag-grid-vue>
    </v-container>
    <v-divider></v-divider>
    <div v-show="!showFiltroAsociado">
      <div style="max-height: 4px">
        <v-progress-linear
          indeterminate
          color="primary"
          v-show="cargando"
        ></v-progress-linear>
      </div>
      <v-btn
        class="error"
        style="padding-right: 20px"
        :disabled="disabled"
        @click="desasociar"
      >
        <v-icon dark style="color=black" left>cancel</v-icon>
        <span>Desasociar</span>
      </v-btn>
    </div>
    <div v-show="showFiltroAsociado">
      <v-btn
        class="error"
        style="padding-right: 20px"
        :disabled="!showFiltroAsociado"
        @click="desasociar"
      >
        <v-icon dark style="color=black" left>cancel</v-icon>
        <span>Desasociar filtro asignado</span>
      </v-btn>
    </div>
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
import store from '@/store';
import {
  fetchVehiculos,
  Vehiculo,
} from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';
@Component({
  components: {
    AgGridVue,
  },
})
export default class GridSeleccionDesasociar extends Vue {
  show = false;
  showFiltroAsociado = false;
  disabledAsociado = false;
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
  data: any[] = [];
  $snotify: any;
  elementoSeleccionado: number = null;
  search: string = '';
  intervalo: any;
  plataformaKey: number = null;
  Plataformas = new Plataformas();
  filtroNoAsignados: boolean = false;
  bodyDesasociar: any = true;
  disabled: boolean = true;
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
      { headerName: 'Nombre transportista', field: 'nom_transportista' },
      { headerName: 'Rut transportista', field: 'rut_transportista' },
      {
        headerName: 'Vehiculo',
        field: 'vehiculo',
        filter: 'agSetColumnFilter',
      },
      { headerName: 'Flota', field: 'flota' },
      { headerName: 'Grupo', field: 'grupo' },
      { headerName: 'codigo vehiculo', field: 'cod_vehiculo' },
      { headerName: 'Grupo', field: 'cod_grupovehiculo' },
      { headerName: 'Plataforma', field: 'plataforma' },
      { headerName: 'codigo flota', field: 'cod_flota' },
      { headerName: 'Id ', field: 'id' },
      { headerName: 'Mandante', field: 'mandante' },
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
    console.log(body);
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
          solo_asociaciones: 'SI',
        };
        result = await fetchDashboard(body, uri);
        break;
      case 1:
        patentes = [];
        uri = 'mantenedor_transp_mandante/get_grilla';
        body = {
          plataforma: this.Plataformas.getNombrePorIdPlataformas(plataforma),
          cod_grupo: codFiltroSeleccion,
          cod_flota: '',
          patentes: patentes,
          solo_asociaciones: 'SI',
        };
        result = await fetchDashboard(body, uri);

        break;
    }
    console.log('se obtiene la grilla', result);
    result.data.CODIGO_RESPUESTA == 1
      ? ((this.rowData = result.data.data),
        this.esAsocidadoFiltro(result.data.data))
      : this.reset();
    this.data = this.rowData;
  }
  esAsocidadoFiltro(result: any) {
    let resultado = [];
    console.log(
      'validar si el resultado es una asociacion de filtro con id asoc',
      result[0].id_asoc
    );
    resultado = result.filter(
      (value: any) => value.id_asoc == result[0].id_asoc
    );
    if (resultado.length > 1) {
      console.log(
        'este es el largo de los id asoc encontrados iguales',
        resultado.length
      );
      this.bodyDesasociar = this.getBody(
        this.plataformaKey,
        result[0],
        this.filtroKey
      );
      this.showFiltroAsociado = true;
    } else {
      this.showFiltroAsociado = false;
    }
  }
  getBody(plataformaKey: number, data: any, filtroKey: number) {
    let bodys: any[] = [];
    if (data.length >= 1) {
      data.map((row: any) => {
        bodys = [
          ...bodys,
          {
            plataforma: this.Plataformas.getNombrePorIdPlataformas(
              plataformaKey
            ),
            id_asoc: row.id_asoc,
            user_id: store.state.userId,
          },
        ];
      });
    } else {
      bodys = [
        {
          plataforma: this.Plataformas.getNombrePorIdPlataformas(plataformaKey),
          id_asoc: data.id_asoc,
          user_id: store.state.userId,
        },
      ];
    }

    return bodys;
  }
  onRowSelected(event: any) {
    let selectedNodes = this.gridApi.getSelectedNodes();
    let selectedData = selectedNodes.map((node: any) => node.data);
    let data: any;
    let bodys;
    let reset;
    data = selectedData;

    selectedData.length == 0
      ? (bodys = null)
      : (bodys = this.getBody(this.plataformaKey, data, this.filtroKey));

    bodys
      ? ((this.bodyDesasociar = bodys), (this.disabled = false))
      : ((this.bodyDesasociar = []), (this.disabled = true));
  }

  async desasociar() {
    let result;
    this.disabled = true;
    let promises: any = [];
    let resultado: any = [];
    let data: any;
    this.cargando = true;
    let url = 'mantenedor_transp_mandante/desasociar';
    console.log('body dasasociarA', this.bodyDesasociar);
    if (this.bodyDesasociar.length == 1) {
      console.log('el largo de el body es 1');
      result = await fetchDashboard(this.bodyDesasociar[0], url);
      data = await result.data;
      data
        ? data.CODIGO_RESPUESTA == 1
          ? (this.$snotify.success(this.$t('Desasociación exitosa')),
            (this.cargando = false),
            this.getGrilla(
              this.codigoFiltroSeleccion,
              this.filtroKey,
              this.plataformaKey
            ),
            (this.disabled = true),
            (this.showFiltroAsociado = false),
            asociacionEventBus.$emit(
              'EtiquetaFlotaSeleccion',
              this.codigoFiltroSeleccion,
              this.plataformaKey,
              this.filtroKey
            ))
          : this.$snotify.error(data.CODIGO_RESPUESTA)
        : this.$snotify.error('Error en la consulta');
    } else {
      if (this.showFiltroAsociado) {
        resultado = await fetchDashboard(this.bodyDesasociar[0], url);
        console.log(this.bodyDesasociar[0]);
      } else {
        await this.bodyDesasociar.map(async (body: any) => {
          promises.push(fetchDashboard(body, url));
        });
        data = await Promise.all(promises);
        resultado = await data[0].data;
      }

      resultado
        ? resultado.CODIGO_RESPUESTA == 1
          ? (this.$snotify.success('Desasociación exitosa'),
            this.getGrilla(
              this.codigoFiltroSeleccion,
              this.filtroKey,
              this.plataformaKey
            ),
            (this.cargando = false),
            (this.disabled = true),
            (this.showFiltroAsociado = false),
            asociacionEventBus.$emit(
              'EtiquetaFlotaSeleccion',
              this.codigoFiltroSeleccion,
              this.plataformaKey,
              this.filtroKey
            ))
          : this.$snotify.error(resultado.MENSAJE_RESPUESTA)
        : this.$snotify.error('Error en la consulta');
    }
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
