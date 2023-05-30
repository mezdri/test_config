<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <StepTitle>Asociar Pauta y Frecuencia</StepTitle>
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
              :row-data="pautas"
            />
            <AsociacionGrid
              v-else
              :grid-options="gridOptions"
              :row-data="pautas"
              :esEditar="!planMantenimientoSeleccionado ? false : true"
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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams,
  CellValueChangedEvent,
  ValueGetterParams,
  ValueSetterParams,
  CellClickedEvent,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { intersectionBy } from 'lodash';
import AsociacionGrid from '@/reusable/Grid/AsociacionGrid.vue';
import { LoadingService } from '@/services/loadingService';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import AgregarButton from '@/reusable/Grid/AgregarButton.vue';
import { fetchPautasActividades } from '@/pantallas/PautasActividades/fetchPautasActividades';
import { checkboxColumnDef } from '@/reusable/Grid/aggridColumnDefUtils';
import { Snotify } from '@/snotify/Snotify';
import Buscador from '@/reusable/Grid/Buscador.vue';
import { TipoFrecuencias } from '@/config/enums';
import { PautaActividad as PautaActividadType } from '../PautasActividades/PautaActividad';
import { PautasPlanesMantenimiento } from './Data/PlanMantenimiento';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import NumericEditor from '@/reusable/Grid/Editors/NumericEditor.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import {
  PlanMantenimiento,
  PlanMantenimientoNueva,
  PlanMantenimientoDetalle,
} from '@/pantallas/PlanesMantenimiento/Data/PlanMantenimiento';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import numericEditorBus from '@/reusable/Grid/Editors/NumericEditorBus';

type PautaFrecuenciaRow = PautaActividadType & {
  frecuenciaKilometraje: number;
  frecuenciaHorasMotor: number;
  frecuenciaTiempo: number;
  frecuenciaTipoNombre: string;
};

const tiposFreciencia = ['Dias', 'Meses', 'Semanas'];

@Component({
  components: {
    StepTitle,
    Buscador,
    AgregarButton,
    CabeceraTabla,
    AsociacionGrid,
    BuscadorOperacionCrud,
    MantenedorGridVerDetalle,
    MensajeValidacion,
  },
})
export default class AsociarPautaFrecuenciaGrid extends Vue {
  @Prop({ default: false }) disabled: boolean;
  @Prop() pautasSeleccionadas: PautaFrecuenciaRow[];
  @Prop() planMantenimientoSeleccionado: PlanMantenimientoDetalle;

  /* aggrid */

  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'id',
        hide: true,
      },
      {
        headerName: 'Nombre',
        field: 'nombrePauta',
        lockVisible: true,
        suppressMovable: true,
      },
      {
        headerName: 'Kilometraje',
        field: 'frecuenciaKilometraje',
        cellEditorFramework: NumericEditor,
        cellEditorParams: { parentName: this.$options.name },
        cellRenderer: this.formatEditable,
        valueGetter: (params: ValueGetterParams) => {
          if (this.disabled) {
            return params.data.frecuenciaKilometraje;
          }
          if (!params.node.isSelected()) {
            return '';
          }
          return params.data.frecuenciaKilometraje;
        },
        editable: this.editCell,
      },
      {
        headerName: 'Horas Motor',
        field: 'frecuenciaHorasMotor',
        valueGetter: (params: ValueGetterParams) => {
          if (this.disabled) {
            return params.data.frecuenciaHorasMotor;
          }
          if (!params.node.isSelected()) {
            return '';
          }
          return params.data.frecuenciaHorasMotor;
        },
        cellEditorFramework: NumericEditor,
        cellEditorParams: { parentName: this.$options.name },
        cellRenderer: this.formatEditable,
        editable: this.editCell,
      },
      {
        headerName: 'Tiempo',
        field: 'frecuenciaTiempo',
        valueGetter: (params: ValueGetterParams) => {
          if (this.disabled) {
            return params.data.frecuenciaTiempo;
          }
          if (!params.node.isSelected()) {
            return '';
          }
          return params.data.frecuenciaTiempo;
        },
        cellEditorFramework: NumericEditor,
        cellEditorParams: { parentName: this.$options.name },
        cellRenderer: this.formatEditable,
        editable: this.editCell,
      },
      {
        headerName: '',
        field: 'frecuenciaTipoNombre',
        editable: this.editCell,
        cellEditor: 'agRichSelectCellEditor',
        cellRenderer: this.formatLista,
        cellEditorParams: {
          values: tiposFreciencia,
        },
      },
    ],
    onGridReady: this.handleGridReady,
    onCellValueChanged: this.onCellValueChanged,
    onSelectionChanged: this.onSelectionChanged,
    onRowSelected: this.onRowSelected,
    singleClickEdit: true,
  };

  /* state */
  pautas: PautaFrecuenciaRow[] = [];
  pautaSeleccionada: PautaActividadType = null;
  idPlan: number = 0;

  /*Validacion*/
  showValidacion: boolean = false;
  tituloValidacion: string = '';
  mensajeValidacion: string = '';

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  constructor() {
    super();
  }

  /* event handlers */

  async handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;

    numericEditorBus.handleFocusout(this.$options.name, () =>
      this.gridApi.stopEditing()
    );

    // @ts-ignore
    this.pautas = ((await this.fetchPautasActividades()) || []).map(pauta => ({
      ...pauta,
      frecuenciaTipoNombre: tiposFreciencia[0],
    }));
    this.pautas = this.pautas.filter(x => x.estado);

    this.setPautasSeleccionadas();
  }

  setPautasSeleccionadas() {
    if (!this.pautasSeleccionadas) {
      return;
    }
    this.pautas = intersectionBy(
      [
        ...this.pautasSeleccionadas.map(pautaSeleccionada => {
          const pauta = this.pautas.find(x => x.id === pautaSeleccionada.id);
          return {
            ...pautaSeleccionada,
            nombrePauta: pauta
              ? pauta.nombrePauta
              : pautaSeleccionada.nombrePauta,
          };
        }),
        ...this.pautas,
      ],
      (pauta: PautaFrecuenciaRow) => pauta.id
    );

    // Permitir a ag-grid tiempo de renderizar el nuevo conjunto de filas
    setTimeout(() => {
      this.gridApi.forEachNode(nodo => {
        const seleccionada = this.pautasSeleccionadas.find(
          x => x.id === nodo.data.id
        );

        nodo.setSelected(seleccionada ? true : false);
      });

      if (this.disabled) {
        this.pautas = this.gridApi.getSelectedRows();
      }
    });
  }

  @Watch('planMantenimientoSeleccionado', { deep: true, immediate: true })
  async handlePlanSeleccionadoChange() {
    if (!this.planMantenimientoSeleccionado) {
      this.idPlan = 0;
      return;
    }
    this.idPlan = this.planMantenimientoSeleccionado.id;
  }

  /* template */

  /* tabla */

  formatFecha(params: ValueFormatterParams) {
    return params.value.format('DD/MM/YYYY');
  }

  formatDuration(params: ValueFormatterParams) {
    return params.value.asSeconds();
  }

  formatLista(params: ValueFormatterParams) {
    return `<div style="display: flex;">${params.value}
      <div style="margin-left:auto;"><i class="material-icons" style="font-size: 20px;vertical-align:middle;position: relative;">arrow_drop_down</i></div></div>`;
  }

  formatEditable(params: ValueFormatterParams) {
    if (params.value === undefined || params.value === '') {
      if (params.node.isSelected()) {
        return '<i class="material-icons" style="font-size:19px;opacity:0.2;">create</i>';
      } else {
        return '';
      }
    }
    return params.value;
  }

  editCell(params: any) {
    if (!this.disabled) {
      if (params.node.isSelected()) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  formatValue(params: ValueSetterParams) {
    if (params.node.isSelected()) {
      return params.newValue;
    }

    return '';
  }

  makePautaPlanesMantenimiento(
    rowData: PautaFrecuenciaRow
  ): PautasPlanesMantenimiento {
    const getFrecuenciaId = (nombreFrecuencia: string) => {
      switch (nombreFrecuencia) {
        case 'Dias':
          return TipoFrecuencias.Dias;
        case 'Semanas':
          return TipoFrecuencias.Semanas;
        case 'Meses':
          return TipoFrecuencias.Meses;
      }
    };

    return {
      id: rowData.id,
      frecuenciaKilometraje: rowData.frecuenciaKilometraje,
      frecuenciaHorasMotor: rowData.frecuenciaHorasMotor,
      frecuenciaTiempo: rowData.frecuenciaTiempo,
      tipoFrecuencia: getFrecuenciaId(rowData.frecuenciaTipoNombre),
    };
  }

  onPautasChange() {
    const pautas: PautasPlanesMantenimiento[] = this.gridApi
      .getSelectedNodes()
      .map(node => this.makePautaPlanesMantenimiento(node.data));

    let filasVacias: number[] = [];

    pautas.forEach(pauta => {
      let countnull = 0;
      if (
        !pauta.frecuenciaKilometraje ||
        pauta.frecuenciaKilometraje === undefined
      ) {
        countnull = countnull + 1;
      }
      if (
        !pauta.frecuenciaHorasMotor ||
        pauta.frecuenciaHorasMotor === undefined
      ) {
        countnull = countnull + 1;
      }
      if (!pauta.frecuenciaTiempo || pauta.frecuenciaTiempo === undefined) {
        countnull = countnull + 1;
      }

      filasVacias.push(countnull);
    });

    let validKilometros: boolean = true;

    this.pautas.forEach(p => {
      if (p.frecuenciaKilometraje || p.frecuenciaKilometraje != undefined) {
        if (p.frecuenciaKilometraje != 0) {
          if (p.frecuenciaKilometraje.toString().length > 0) {
            if (p.frecuenciaKilometraje < 500) {
              validKilometros = false;
            }
          }
        }
      }
      if (p.frecuenciaHorasMotor || p.frecuenciaHorasMotor != undefined) {
        if (p.frecuenciaHorasMotor != 0) {
          if (p.frecuenciaHorasMotor.toString().length > 0) {
            if (p.frecuenciaHorasMotor < 50) {
              validKilometros = false;
            }
          }
        }
      }
    });

    const valid =
      filasVacias.filter(filasVacias => filasVacias === 3).length === 0;

    this.$emit('change', pautas, valid, validKilometros);
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    this.onPautasChange();
    this.gridApi.redrawRows();
  }

  onCellClicked(params: CellClickedEvent) {
    if (params.node.isSelected()) {
      return;
    }

    params.node.setSelected(true);

    // params.node.setSelected(true);
    this.gridApi.startEditingCell({
      rowIndex: params.node.rowIndex,
      colKey: params.colDef.field,
    });
  }

  async onRowSelected(e: any) {
    if (e.node.selected === false && this.idPlan != 0) {
      const axios = new AxiosVue(ServicioProxy.Mantenimiento);
      const idPauta = e.data.id;
      const res = await axios.http.get(
        `PautaActividad/ChequearAsociacionPlanMantenimiento/${this.idPlan}/${idPauta}`
      );
      if (res.data == 2) {
        this.gridApi.selectNode(e.node, true);
        this.tituloValidacion = 'Desasociar Pauta';
        this.mensajeValidacion =
          'La Pauta de Actividades que se desea desasociar tiene un Registro de Mantenimiento Preventivo, por esta razón no se puede desasociar.';
        this.showValidacion = true;
      }
    }
  }

  /* util */

  onCellValueChanged({
    colDef,
    data: { id, tipoActividad },
  }: CellValueChangedEvent) {
    this.onPautasChange();
  }

  fetchPautasActividades() {
    this.loadingService.showLoading();
    return fetchPautasActividades()
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
