import { RowNode as AgGridRowNode } from 'ag-grid-community';

export interface RowNode<T> extends AgGridRowNode {
  data: T;
}
