<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md text-xs-center>
            <StepTitle>Cabeceras HTTP</StepTitle>
            <v-divider></v-divider>
            <v-layout row wrap>
              <v-flex xs12 sm6 md6 offset-xs10 align-end>
                <AgregarButton
                  @click="handleAgregarClick()"
                  v-show="!modoVer"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex md12>
                <v-card>
                  <MantenedorGrid v-if="!modoVer" :grid-options="gridOptions" />
                  <MantenedorGridVerDetalle
                    v-else
                    :grid-options="gridOptionsVerDetalle"
                  />
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
    <CrearCabeceraHttpModal
      :show="muestraModalCabecera"
      :modoEditar="modoEditarCabecera"
      :cabeceraSeleccionada="cabeceraSeleccionada"
      @cerrar="handleCierreModal"
      @crear="handleModalCabeceraCrear"
      @editar="handleModalCabeceraEditar"
    ></CrearCabeceraHttpModal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { actionsEvent } from '@/setup';

const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';

import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import { makeAccionesModal } from '@/reusable/Grid/aggridColumnDefUtils';
import AgregarButton from '@/reusable/Grid/AgregarButton.vue';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';

import CrearCabeceraHttpModal from '@/pantallas/ContratoProveedor/CrearCabeceraHttpModal.vue';
import { ScriptValidacion } from '@/interfaces/ContratoProveedor';

@Component({
  components: {
    StepTitle,
    MantenedorGrid,
    MantenedorGridVerDetalle,
    AgregarButton,
    CrearCabeceraHttpModal,
  },
})
export default class CabecerasHttp extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() lstCabecerasHttpEditarVer: ScriptValidacion[];

  muestraModalCabecera: boolean = false;
  modoEditarCabecera: boolean = false;
  lstCabecerasHttp: ScriptValidacion[] = [];
  cabeceraSeleccionada: ScriptValidacion = {};

  /* aggrid */

  columnApi: ColumnApi;
  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
        cellStyle: { textAlign: 'left', 'pointer-events': 'none' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
      },
      {
        headerName: 'Valor',
        field: 'script',
      },
      makeAccionesModal({
        onEliminar: this.handleEliminarClick,
        onEditar: this.handleEditarClick,
      }),
    ],
    onGridReady: this.handleGridReady,
  };

  readonly gridOptionsVerDetalle: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
        cellStyle: { textAlign: 'left', 'pointer-events': 'none' },
      },
      {
        headerName: 'Nombre',
        field: 'nombre',
      },
      {
        headerName: 'Valor',
        field: 'script',
      },
    ],
    onGridReady: this.handleGridReady,
  };

  mounted() {
    this.handleLstCabecerasHttpEditarVerChange();
  }

  /* event handlers */

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.setRowData(this.lstCabecerasHttp);
  }

  @Watch('lstCabecerasHttpEditarVer', { deep: true, immediate: true })
  handleLstCabecerasHttpEditarVerChange() {
    if (this.gridApi != null) {
      this.lstCabecerasHttp = this.lstCabecerasHttpEditarVer;
      this.gridApi.setRowData(this.lstCabecerasHttp);
    }
  }

  handleAgregarClick() {
    this.muestraModalCabecera = true;
  }

  handleCierreModal() {
    this.muestraModalCabecera = false;
    this.modoEditarCabecera = false;
    this.cabeceraSeleccionada = {};
  }

  handleModalCabeceraCrear(cabeceraHttp: ScriptValidacion) {
    if (!this.lstCabecerasHttp) {
      this.lstCabecerasHttp = [];
    }

    this.lstCabecerasHttp.push(cabeceraHttp);
    this.$emit('change', this.lstCabecerasHttp);
    this.gridApi.setRowData(this.lstCabecerasHttp);
  }

  handleModalCabeceraEditar(cabeceraHttp: ScriptValidacion) {
    var index = this.lstCabecerasHttp.findIndex(
      s => s.nombre == this.cabeceraSeleccionada.nombre
    );

    this.lstCabecerasHttp[index].nombre = cabeceraHttp.nombre;
    this.lstCabecerasHttp[index].script = cabeceraHttp.script;

    this.gridApi.setRowData(this.lstCabecerasHttp);
    this.$emit('change', this.lstCabecerasHttp);
  }

  handleEliminarClick(params: any) {
    if (!this.modoVer) {
      var index = this.lstCabecerasHttp.findIndex(
        s => s.nombre == params.nombre
      );

      this.lstCabecerasHttp.splice(index, 1);

      this.gridApi.setRowData(this.lstCabecerasHttp);
      this.$emit('change', this.lstCabecerasHttp);
    }
  }

  handleEditarClick(params: any) {
    if (!this.modoVer) {
      this.cabeceraSeleccionada = params;
      this.modoEditarCabecera = true;
      this.muestraModalCabecera = true;
    }
  }
}
</script>
