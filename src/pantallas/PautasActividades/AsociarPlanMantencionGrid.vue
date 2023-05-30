<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-container grid-list-md>
          <StepTitle>Asociar Plan de Mantenimiento</StepTitle>
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
              :row-data="planes"
            />
            <MantenedorGrid
              v-else
              :grid-options="gridOptions"
              :row-data="planes"
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
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import {
  GridApi,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams,
  CellValueChangedEvent,
  ValueGetterParams,
  CellClickedEvent,
} from 'ag-grid-community';
import { intersectionBy } from 'lodash';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import MantenedorGridVerDetalle from '@/reusable/Grid/MantenedorGridVerDetalle.vue';
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
import Buscador from '@/reusable/Grid/Buscador.vue';
import BuscadorOperacionCrud from '@/reusable/Grid/BuscadorOperacionCrud.vue';
import {
  ActividadMantenimiento as ActividadMantenimientoType,
  PautaActividadesMantenimiento,
  ActividadMantenimiento,
} from '@/pantallas/ActividadesMantenimiento/ActividadMantenimiento';
import { TipoActividadesMantenimiento, TipoFrecuencias } from '@/config/enums';
import { PautaActividad as PautaActividadType } from '../PautasActividades/PautaActividad';
import {
  PautasPlanesMantenimiento,
  PlanMantenimiento as PlanMantenimientoType,
} from '@/pantallas/PlanesMantenimiento/Data/PlanMantenimiento';
import { fetchPlanesMantenimiento } from '../PlanesMantenimiento/Data/fetchPlanesMantenimiento';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import NumericEditor from '@/reusable/Grid/Editors/NumericEditor.vue';
import { PautaActividadDetalle } from './PautaActividad';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import MensajeValidacion from '@/reusable/Mantenedor/MensajeValidacion.vue';
import numericEditorBus from '@/reusable/Grid/Editors/NumericEditorBus';

type PlanMantenimientoRow = PlanMantenimientoType & {
  frecuenciaKilometraje: number;
  frecuenciaHorasMotor: number;
  frecuenciaTiempo: number;
  frecuenciaTipoNombre: string;
};

const tiposFreciencia = ['Días', 'Semanas', 'Meses'];

@Component({
  components: {
    StepTitle,
    Buscador,
    AgregarButton,
    CabeceraTabla,
    MantenedorGrid,
    BuscadorOperacionCrud,
    MantenedorGridVerDetalle,
    MensajeValidacion,
  },
})
export default class AsociarPautaFrecuenciaGrid extends Vue {
  @Prop({ default: false }) disabled: boolean;
  @Prop() planesSeleccionados: PlanMantenimientoRow[];
  @Prop() pautaSeleccionada: PautaActividadDetalle;
  /* ComponenteBase */

  /* aggrid */

  gridApi: GridApi = null;
  editable: boolean = false;

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
        field: 'nombre',
        lockVisible: true,
      },
      {
        headerName: 'Kilómetros',
        field: 'frecuenciaKilometraje',
        cellEditorParams: { parentName: this.$options.name },
        valueGetter: (params: ValueGetterParams) => {
          if (this.disabled) {
            return params.data.frecuenciaKilometraje;
          }
          if (!params.node.isSelected()) {
            return '';
          }
          return params.data.frecuenciaKilometraje;
        },
        cellEditorFramework: NumericEditor,
        cellRenderer: this.formatEditable,
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
        cellRenderer: this.formatLista,
        cellEditor: 'agRichSelectCellEditor',
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
  planes: PlanMantenimientoRow[] = [];
  idPauta: number = 0;

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
    this.planes = ((await this.fetchPlanesMantenimiento()) || []).map(plan => ({
      ...plan,
      frecuenciaTipoNombre: tiposFreciencia[0],
    }));

    this.setPlanesSeleccionados();
  }

  setPlanesSeleccionados() {
    if (!this.planesSeleccionados) {
      return;
    }

    this.planes = intersectionBy(
      [
        ...this.planesSeleccionados.map(planSeleccionado => {
          const plan = this.planes.find(x => x.id === planSeleccionado.id);
          return {
            ...planSeleccionado,
            nombrePlan: plan ? plan.nombre : '',
          };
        }),
        ...this.planes,
      ],
      (plan: PlanMantenimientoRow) => plan.id
    );

    setTimeout(() => {
      this.gridApi.forEachNode(nodo => {
        const seleccionada = this.planesSeleccionados.find(
          x => x.id === nodo.data.id
        );

        nodo.setSelected(seleccionada ? true : false);
      });

      if (this.disabled) {
        this.planes = this.gridApi.getSelectedRows();
      }
    });
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
    if (this.disabled) {
      return params.value;
    }
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

  makePautaPlanesMantenimiento(
    rowData: PlanMantenimientoRow
  ): PautasPlanesMantenimiento {
    const getFrecuenciaId = (nombreFrecuencia: string) => {
      switch (nombreFrecuencia) {
        case 'Días':
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

  onPlanesChange() {
    const planes: PautasPlanesMantenimiento[] = this.gridApi
      .getSelectedNodes()
      .map(node => this.makePautaPlanesMantenimiento(node.data));

    let filasVacias: number[] = [];

    planes.forEach(plan => {
      let countnull = 0;
      if (
        !plan.frecuenciaKilometraje ||
        plan.frecuenciaKilometraje === undefined
      ) {
        countnull = countnull + 1;
      }
      if (
        !plan.frecuenciaHorasMotor ||
        plan.frecuenciaHorasMotor === undefined
      ) {
        countnull = countnull + 1;
      }
      if (!plan.frecuenciaTiempo || plan.frecuenciaTiempo === undefined) {
        countnull = countnull + 1;
      }

      filasVacias.push(countnull);
    });

    const valid =
      filasVacias.filter(filasVacias => filasVacias === 3).length === 0;

    this.$emit('change', planes, valid);
  }

  @Watch('pautaSeleccionada', { deep: true, immediate: true })
  handleCalendarioSeleccionadaChange() {
    if (!this.pautaSeleccionada) {
      this.idPauta = 0;
      return;
    }
    this.idPauta = this.pautaSeleccionada.id;
  }
  /*Validamos que si el plan que se esta desseleccionando, tenga solo a la actual pauta asociada */
  /*De ser asi no debe permitir desmarcar el plan */
  async onRowSelected(e: any) {
    if (e.node.selected === false && this.idPauta != 0) {
      const axios = new AxiosVue(ServicioProxy.Mantenimiento);
      const idPlan = e.data.id;
      const res = await axios.http.get(
        `PautaActividad/ChequearAsociacionPlanMantenimiento/${idPlan}/${this.idPauta}`
      );
      if (res.data == 1) {
        this.gridApi.selectNode(e.node, true);
        this.tituloValidacion = 'Desasociar Plan de Mantenimiento';
        this.mensajeValidacion =
          'No se puede desasociar este Plan de Mantenimiento debido a que esta es la única Pauta de Actividades asociada.';
        this.showValidacion = true;
      }
      if (res.data == 2) {
        this.gridApi.selectNode(e.node, true);
        this.tituloValidacion = 'Desasociar Plan de Mantenimiento';
        this.mensajeValidacion =
          'El Plan de Mantenimiento que se desea desasociar tiene un Registro de Mantenimiento Preventivo, por esta razón no se puede desasociar';
        this.showValidacion = true;
      }
    }
  }

  onSelectionChanged() {
    this.gridApi.redrawRows();
    this.onPlanesChange();
  }

  /* util */

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

  onCellValueChanged({
    colDef,
    data: { id, tipoActividad },
  }: CellValueChangedEvent) {
    this.onPlanesChange();
  }

  fetchPlanesMantenimiento() {
    this.loadingService.showLoading();
    return fetchPlanesMantenimiento()
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
