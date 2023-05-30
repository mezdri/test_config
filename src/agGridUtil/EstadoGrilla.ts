import { ColumnState } from 'ag-grid-community/dist/lib/columnController/columnController';

export class EstadoGrilla {
  estadoColumna: ColumnState[];
  estadoGrupo: { groupId: string; open: boolean }[];
  estadoOrden: { colId: string; sort: string }[];
  estadoFiltro: any;
}
