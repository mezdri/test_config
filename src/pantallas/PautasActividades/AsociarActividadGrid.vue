<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <StepTitle>Asociar Actividades</StepTitle>
          <v-divider></v-divider>
          <br />
          <CabeceraTabla>
            <template v-slot:izquierda>
              <BuscadorOperacionCrud
                :filter="gridApi && gridApi.setQuickFilter.bind(gridApi)"
              />
            </template>
          </CabeceraTabla>
          <div align="left">
            <MantenedorGridVerDetalle
              v-if="disabled"
              :grid-options="gridOptions"
              :row-data="actividades"
            />
            <MantenedorGrid
              v-else
              :grid-options="gridOptions"
              :row-data="actividades"
            />
          </div>
        </v-container>
      </v-card>
    </v-flex>
    <MensajeValidacion
      :showDialog="showValidacion"
      :titulo="$t(tituloValidacion)"
      :mensaje="$t(mensajeValidacion)"
      v-on:modalConfirmationEmit="showValidacion = false"
    ></MensajeValidacion>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { intersectionBy } from 'lodash';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ValueFormatterParams,
  CellValueChangedEvent,
} from 'ag-grid-community';

import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGrid.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import AgregarButton from '@/reusable/Grid/AgregarButton.vue';
import { fetchPautasActividades } from '@/pantallas/PautasActividades/fetchPautasActividades';
import {
  checkboxColumnDef,
  makeAccionesColumnDef_DEPRECATED,
} from '@/reusable/Grid/aggridColumnDefUtils';
import { Accion, ComponenteBase } from '@/views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import { actionsEvent } from '@/setup';
import { Snotify } from '@/snotify/Snotify';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import { fetchActividadMantenimiento } from '@/pantallas/ActividadesMantenimiento/fetchActividadesMantenimiento';
import {
  ActividadMantenimiento as ActividadMantenimientoType,
  PautaActividadesMantenimiento,
  ActividadMantenimiento,
} from '@/pantallas/ActividadesMantenimiento/ActividadMantenimiento';
import { TipoActividadesMantenimiento } from '@/config/enums';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import { PautaActividadDetalle } from './PautaActividad';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';

type ActividadMantenimientoRow = ActividadMantenimiento & {
  // id: number;
  // nombre: string;
  tipoActividadMantNombre: string;
};

const tiposActividad = ['Realizar', 'Cambiar', 'Inspeccionar'];
type PautaActividad = {
  id: number;
  tipoActividadMant: number;
  tipoActividadMantNombre: string;
};

@Component({
  components: {
    StepTitle,
    BuscadorOperacionCrud,
    AgregarButton,
    CabeceraTabla,
    MantenedorGrid,
    MantenedorGridVerDetalle,
    MensajeValidacion,
  },
})
export default class AsociarActividadGrid extends ComponenteBase {
  @Prop({ default: false }) disabled: boolean;
  @Prop()
  actividadesSeleccionadas: ActividadMantenimientoRow[];
  @Prop() pautaSeleccionada: PautaActividadDetalle;
  /* ComponenteBase */

  accionConsultar: PermisoAccion = {
    accionCodigo: 1,
    visible: false,
  };

  accionCrear: PermisoAccion = {
    accionCodigo: 2,
    visible: false,
  };

  accionEliminar: PermisoAccion = {
    accionCodigo: 5,
    visible: false,
  };

  accionExportar: PermisoAccion = {
    accionCodigo: 6,
    visible: false,
  };

  accionesTotales: PermisoAccion[] = [
    this.accionConsultar,
    this.accionCrear,
    this.accionEliminar,
    this.accionExportar,
  ];
  readonly codigoAccionesMenuItem = Object.values(codigoAccionesMenuItem);
  readonly funcionalidad: Funcionalidades = Funcionalidades.PautasActividades;

  /* aggrid */

  gridApi: GridApi = null;

  /*Validacion*/
  showValidacion: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        ...checkboxColumnDef,
        headerCheckboxSelection: !this.disabled,
        headerCheckboxSelectionFilteredOnly: true,
        hide: this.disabled,
        cellRenderer: (r: any) => {
          if (r.data.checked) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombreActividad',
        lockVisible: true,
      },
      {
        headerName: 'Acción',
        field: 'tipoActividadMantNombre',
        width: 150,
        editable: !this.disabled,
        cellRenderer: this.formatLista,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values: tiposActividad,
        },
      },
    ],
    pagination: true,
    singleClickEdit: true,
    paginationPageSize: 5,
    onGridReady: this.handleGridReady,
    onCellValueChanged: this.onCellValueChanged,
    onSelectionChanged: this.onSelectionChanged,
    suppressCopyRowsToClipboard: true,
    onRowSelected: this.onRowSelected,
  };

  /* state */
  actividades: ActividadMantenimientoRow[] = [];
  actividadSeleccionada: ActividadMantenimientoType = null;
  mostrarConfirmacionEliminar: boolean = false;
  mostrarModalCrear: boolean = false;
  idPauta: number = 0;

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();
  }

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;

    this.actividades = ((await this.fetchActividadMantenimiento()) || []).map(
      actividad => ({
        ...actividad,
        tipoActividadMantNombre: tiposActividad[0],
      })
    );
    this.actividades = this.actividades.filter(x => x.estado === 1);
    this.setActividadesSeleccionadas();
  }

  setActividadesSeleccionadas() {
    if (!this.actividadesSeleccionadas) {
      return;
    }

    this.actividades = intersectionBy(
      [
        ...this.actividadesSeleccionadas.map(actividadSeleccionada => {
          const actividad = this.actividades.find(
            x => x.id === actividadSeleccionada.id
          );
          return {
            ...actividadSeleccionada,
            nombreActividad: actividad
              ? actividad.nombreActividad
              : actividadSeleccionada.nombreActividad,
          };
        }),
        ...this.actividades,
      ],
      (actividad: ActividadMantenimientoRow) => actividad.id
    );

    setTimeout(() => {
      this.gridApi.forEachNode(nodo => {
        const seleccionada = this.actividadesSeleccionadas.find(
          x => x.id === nodo.data.id
        );

        nodo.setSelected(seleccionada ? true : false);
      });

      if (this.disabled) {
        this.actividades = this.gridApi.getSelectedRows();
      }
    });
  }

  handleCrearClick() {
    this.mostrarModalCrear = true;
  }

  handleCierreModalCrear() {
    this.mostrarModalCrear = false;
  }

  @Watch('pautaSeleccionada', { deep: true, immediate: true })
  handleCalendarioSeleccionadaChange() {
    if (!this.pautaSeleccionada) {
      this.idPauta = 0;
      return;
    }
    this.idPauta = this.pautaSeleccionada.id;
  }

  /* tabla */

  formatFecha(params: ValueFormatterParams) {
    return params.value.format('DD/MM/YYYY');
  }

  formatDuration(params: ValueFormatterParams) {
    return params.value.asSeconds();
  }

  formatLista(params: ValueFormatterParams) {
    if (this.disabled) {
      return params.value;
    }

    return `<div style="display: flex;">${params.value}
      <div style="margin-left:auto;"><i class="material-icons" style="font-size: 20px;vertical-align:middle;position: relative;">arrow_drop_down</i></div></div>`;
  }

  makePautaActividadesMantenimiento(
    rowData: ActividadMantenimientoRow
  ): PautaActividadesMantenimiento {
    const getTipoActividadId = (nombreTipoActividad: string) => {
      switch (nombreTipoActividad) {
        case 'Cambiar':
          return TipoActividadesMantenimiento.Cambiar;
        case 'Realizar':
          return TipoActividadesMantenimiento.Realizar;
        case 'Inspeccionar':
          return TipoActividadesMantenimiento.Inspeccionar;
      }
    };

    return {
      id: rowData.id,
      nombre: rowData.nombreActividad,
      tipoActividadMant: getTipoActividadId(rowData.tipoActividadMantNombre),
    };
  }

  onActividadesChange() {
    const actividades: PautaActividadesMantenimiento[] = this.gridApi
      .getSelectedNodes()
      .map(node => this.makePautaActividadesMantenimiento(node.data));

    this.$emit('change', actividades);
  }

  onSelectionChanged() {
    this.onActividadesChange();
  }

  async onRowSelected(e: any) {
    if (e.node.selected === false && this.idPauta != 0) {
      const axios = new AxiosVue(ServicioProxy.Mantenimiento);
      const idActividad = e.data.id;
      const res = await axios.http.get(
        `PautaActividad/ChequearAsociacionActividadMant/${this.idPauta}/${idActividad}`
      );
      if (res.data == 1) {
        this.gridApi.selectNode(e.node, true);
        this.tituloValidacion = 'Desasociar Actividad';
        this.mensajeValidacion =
          'La actividad que se desea desasociar tiene un Registro de Mantenimiento Preventivo, por esta razón no se puede desasociar.';
        this.showValidacion = true;
      }
    }
  }

  /* util */

  onCellValueChanged({
    colDef,
    data: { id, tipoActividadMant },
  }: CellValueChangedEvent) {
    // if (colDef.field !== 'tipoActividad') {
    //   return;
    // }

    this.onActividadesChange();
  }

  fetchActividadMantenimiento() {
    this.loadingService.showLoading();
    return fetchActividadMantenimiento()
      .catch(() =>
        this.$snotify.error(
          'Ha ocurrido un error al intentar obtener las Actividades de Mantenimiento. ',
          { timeout: 3000 }
        )
      )
      .finally(() => this.loadingService.hideLoading());
  }
}
</script>
