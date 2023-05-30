import MenuItem from '@/components/MenuItem.vue';
import store from '@/store';
import { Funcionalidades } from '@/config/funcionalidades';
import { codigoAccionesMenuItem } from '@/views/base/VariablesPermisos';
import MenuItemModal from '@/reusable/Grid/MenuItemModal.vue';
import { SelectionChangedEvent, RowNode } from 'ag-grid-community';

export const checkboxColumnDef = {
  headerName: '',
  field: 'checked',
  width: 70,
  minWidth: 70,
  maxWidth: 70,
  pinned: 'left',
  checkboxSelection: true,
  suppressMenu: true,
  filter: false,
  suppressMovable: true,
  sortable: false,
  resizable: false,
  lockVisible: true,
  cellStyle: { textAlign: 'center' },
};

export const checkboxColumnDefAsoCrear = {
  headerName: '',
  field: 'checked',
  width: 70,
  minWidth: 70,
  pinned: 'left',
  checkboxSelection: true,
  suppressMenu: true,
  filter: false,
  suppressMovable: true,
  sortable: true,
  resizable: true,
  lockVisible: true,
  cellStyle: { textAlign: 'left' },
  cellRenderer: (r: any) => {
    if (r.data.checked !== undefined) {
      return r.node.setSelected(r.data.checked);
    }
  },
};

export const checkboxColumnDefAsoEditar = {
  headerName: '',
  field: 'checked',
  sort: 'desc',
  width: 70,
  minWidth: 70,
  pinned: 'left',
  checkboxSelection: true,
  suppressMenu: true,
  filter: false,
  suppressMovable: true,
  sortable: true,
  resizable: true,
  lockVisible: true,
  cellStyle: { textAlign: 'left' },
  cellRenderer: (r: any) => {
    if (r.data.checked !== undefined) {
      return r.node.setSelected(r.data.checked);
    }
  },
};

export const makeAccionesColumnDef = (funcionalidad: Funcionalidades) =>
  makeAccionesColumnDef_DEPRECATED(
    Object.values(codigoAccionesMenuItem),
    funcionalidad
  );

export const makeAccionesColumnDef_DEPRECATED = (
  codigoAccionesMenuItem: number[],
  funcionalidad: Funcionalidades
) => ({
  headerName: 'Acciones',
  width: 120,
  minWidth: 120,
  sortable: false,
  resizable: false,
  filter: false,
  enablePivot: false,
  field: 'id',
  cellRendererFramework: MenuItem,
  cellRendererParams: {
    funcionalidad,
    codigoAccionesMenuItem,
    usuario: store.state.user,
  },
  colId: 'params',
  rowDrag: false,
  pinned: 'right',
  lockVisible: true,
  suppressMovable: true,
  getQuickFilterText: () => '',
  cellStyle: { textAlign: 'center' },
});

export const makeAccionesModal = ({
  onEliminar,
  onVerDetalle,
  onEditar,
}: {
  onEliminar?: (rowData: any) => void;
  onVerDetalle?: (rowData: any) => void;
  onEditar?: (rowData: any) => void;
}) => ({
  headerName: 'Acciones',
  width: 120,
  minWidth: 120,
  sortable: false,
  resizable: false,
  filter: false,
  enablePivot: false,
  field: 'id',
  cellRendererFramework: MenuItemModal,
  cellRendererParams: {
    onEliminar,
    onVerDetalle,
    onEditar,
  },
  colId: 'params',
  rowDrag: false,
  pinned: 'right',
  lockVisible: true,
  suppressMovable: true,
  getQuickFilterText: () => '',
});

export const creadoPorColumnDefs = (field: string) => ({
  headerName: 'Creado por',
  field,
});

export const modificadoPorColumnDefs = (field: string) => ({
  headerName: 'Modificado por',
  field,
});

export const fechaCreacionColumnDefs = (field: string) => ({
  headerName: 'Fecha Creación',
  field,
});

export const fechaModificacionColumnDefs = (field: string) => ({
  headerName: 'Última Modificación',
  field,
});

export const estadoColumnDefs = (field: string) => ({
  headerName: 'Estado',
  field,
});

export const fechaInicioColumnDefs = (field: string) => ({
  headerName: 'Fecha Inicio',
  field,
});

export const fechaTerminoColumnDefs = (field: string) => ({
  headerName: 'Fecha Término',
  field,
});
