<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md text-xs-center>
            <StepTitle>Filtro de Actividad</StepTitle>
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
    <CrearScriptModal
      :show="muestraModalScript"
      :titulo="'Agregar Filtro de Actividad'"
      :modoEditar="modoEditarScript"
      :scriptSeleccionado="scriptSeleccionado"
      @cerrar="handleCierreModal"
      @crear="handleModalScriptCrear"
      @editar="handleModalScriptEditar"
    ></CrearScriptModal>
    <ValidarFiltroActividadModal
      :show="muestraModalValidar"
      :script="scriptValidar"
      @cerrar="handleCierreModal"
    ></ValidarFiltroActividadModal>
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

import { ScriptValidacion } from '@/interfaces/ContratoProveedor';
import CrearScriptModal from '@/pantallas/ContratoProveedor/CrearScriptModal.vue';
import ValidarFiltroActividadModal from '@/pantallas/ContratoProveedor/ValidarFiltroActividadModal.vue';

@Component({
  components: {
    StepTitle,
    MantenedorGrid,
    MantenedorGridVerDetalle,
    AgregarButton,
    CrearScriptModal,
    ValidarFiltroActividadModal,
  },
})
export default class FiltroActividad extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() lstScriptValidacionEditarVer: ScriptValidacion[];

  muestraModalScript: boolean = false;
  modoEditarScript: boolean = false;
  lstScriptValidacion: ScriptValidacion[] = [];
  scriptSeleccionado: ScriptValidacion = {};

  muestraModalValidar: boolean = false;
  scriptValidar: string = '';

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
        headerName: 'Codigo Fuente (Javascript)',
        field: 'script',
      },
      {
        headerName: 'Prueba',
        cellRenderer: this.createIconoPrueba,
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
        headerName: 'Codigo Fuente (Javascript)',
        field: 'script',
      },
    ],
    onGridReady: this.handleGridReady,
  };

  mounted() {
    this.handleLstScriptValidacionEditarVerChange();
  }

  /* event handlers */

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.setRowData(this.lstScriptValidacion);
  }

  createIconoPrueba(params: any) {
    if (params.data) {
      var icon = document.createElement('i');
      icon.innerHTML = 'play_arrow';
      icon.className = 'material-icons';
      icon.style.cssText =
        'cursor:pointer;color:#228B22;font-size: 25px;padding-top:10px;';
      const self = this;
      icon.onclick = function() {
        self.scriptValidar = params.data.script;
        self.muestraModalValidar = true;
      };

      return icon;
    }
  }

  @Watch('lstScriptValidacionEditarVer', { deep: true, immediate: true })
  handleLstScriptValidacionEditarVerChange() {
    if (this.gridApi) {
      this.lstScriptValidacion = this.lstScriptValidacionEditarVer;
      this.gridApi.setRowData(this.lstScriptValidacion);
    }
  }

  handleAgregarClick() {
    this.muestraModalScript = true;
  }

  handleCierreModal() {
    this.muestraModalScript = false;
    this.modoEditarScript = false;
    this.muestraModalValidar = false;
    this.scriptSeleccionado = {};
  }

  handleModalScriptCrear(scriptValidacion: ScriptValidacion) {
    if (!this.lstScriptValidacion) {
      this.lstScriptValidacion = [];
    }

    this.lstScriptValidacion.push(scriptValidacion);
    this.gridApi.setRowData(this.lstScriptValidacion);
    this.$emit('change', this.lstScriptValidacion);
  }

  handleModalScriptEditar(scriptValidacion: ScriptValidacion) {
    var index = this.lstScriptValidacion.findIndex(
      s => s.nombre == this.scriptSeleccionado.nombre
    );

    this.lstScriptValidacion[index].nombre = scriptValidacion.nombre;
    this.lstScriptValidacion[index].script = scriptValidacion.script;

    this.gridApi.setRowData(this.lstScriptValidacion);
    this.$emit('change', this.lstScriptValidacion);
  }

  handleEliminarClick(params: any) {
    if (!this.modoVer) {
      var index = this.lstScriptValidacion.findIndex(
        s => s.nombre == params.nombre
      );

      this.lstScriptValidacion.splice(index, 1);

      this.gridApi.setRowData(this.lstScriptValidacion);
      this.$emit('change', this.lstScriptValidacion);
    }
  }

  handleEditarClick(params: any) {
    if (!this.modoVer) {
      this.scriptSeleccionado = params;
      this.modoEditarScript = true;
      this.muestraModalScript = true;
    }
  }
}
</script>
