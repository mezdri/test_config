export const headers = [
  {
    headerName: 'Código del Vehículo',
    field: 'cod_vehiculo',
    cellStyle: { textAlign: 'left' },
  },
  {
    headerName: 'Código de Flota',
    field: 'cod_flota',
    cellStyle: { textAlign: 'left' },
  },
  {
    headerName: 'Patente del Vehículo',
    field: 'patente_vehiculo',
    cellStyle: { textAlign: 'left' },
  },
  {
    headerName: 'avl_chile',
    field: 'avl_chile',
    editable: true,
    singleClickEdit: true,
    cellStyle: { textAlign: 'left' },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['SI', 'NO'],
    },
  },
  {
    headerName: 'wisetrack_insertarposicion',
    field: 'wisetrack_insertarposicion',
    editable: true,
    singleClickEdit: true,
    cellStyle: { textAlign: 'left' },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['SI', 'NO'],
    },
  },
  {
    headerName: 'cmp_btrack',
    field: 'cmp_btrack',
    editable: true,
    singleClickEdit: true,
    cellStyle: { textAlign: 'left' },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['SI', 'NO'],
    },
  },
  {
    headerName: 'log_solutions',
    field: 'log_solutions',
    editable: true,
    singleClickEdit: true,
    cellStyle: { textAlign: 'left' },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['SI', 'NO'],
    },
  },
  {
    headerName: 'int_samtech_cim',
    field: 'int_samtech_cim',
    editable: true,
    singleClickEdit: true,
    cellStyle: { textAlign: 'left' },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['SI', 'NO'],
    },
  },
  {
    headerName: 'beetrack',
    field: 'beetrack',
    editable: true,
    singleClickEdit: true,
    cellStyle: { textAlign: 'left' },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['SI', 'NO'],
    },
  },
  {
    headerName: 'owl',
    field: 'owl',
    editable: true,
    singleClickEdit: true,
    cellStyle: { textAlign: 'left' },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['SI', 'NO'],
    },
  },
  {
    headerName: 'heligrafics',
    field: 'heligrafics',
    editable: true,
    singleClickEdit: true,
    cellStyle: { textAlign: 'left' },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['SI', 'NO'],
    },
  },
  {
    headerName: 'qanalytics',
    field: 'qanalytics',
    editable: true,
    singleClickEdit: true,
    cellStyle: { textAlign: 'left' },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['SI', 'NO'],
    },
  },
  {
    headerName: 'samtech_dch',
    field: 'samtech_dch',
    editable: true,
    singleClickEdit: true,
    cellStyle: { textAlign: 'left' },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['SI', 'NO'],
    },
  },
  {
    headerName: 'int_codelco',
    field: 'int_codelco',
    editable: true,
    singleClickEdit: true,
    cellStyle: { textAlign: 'left' },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['SI', 'NO'],
    },
  },
  {
    headerName: 'int_camion_go',
    field: 'int_camion_go',
    editable: true,
    singleClickEdit: true,
    cellStyle: { textAlign: 'left' },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['SI', 'NO'],
    },
  },
];

export const headersAll = [
  {
    text: 'Código del Vehículo',
    value: 'cod_vehiculo',
  },
  {
    text: 'Flota',
    value: 'nom_flota',
  },
  {
    text: 'Patente del Vehículo',
    value: 'patente_vehiculo',
  },
  {
    text: 'avl_chile',
    value: 'avl_chile',
  },
  {
    text: 'wisetrack_insertarposicion',
    value: 'wisetrack_insertarposicion',
  },
  {
    text: 'cmp_btrack',
    value: 'cmp_btrack',
  },
  {
    text: 'log_solutions',
    value: 'log_solutions',
  },
  {
    text: 'int_samtech_cim',
    value: 'int_samtech_cim',
  },
  {
    text: 'beetrack',
    value: 'beetrack',
  },
  {
    text: 'owl',
    value: 'owl',
  },
  {
    text: 'heligrafics',
    value: 'heligrafics',
  },
  {
    text: 'qanalytics',
    value: 'qanalytics',
  },
  {
    text: 'samtech_dch',
    value: 'samtech_dch',
  },
  {
    text: 'int_codelco',
    value: 'int_codelco',
  },
  {
    text: 'int_camion_go',
    value: 'int_camion_go',
  },
  {
    text: 'Acciones',
    value: 'actions',
    align: 'rigth',
  },
];

export const headersShort = [
  {
    text: 'Código del Vehículo',
    value: 'cod_vehiculo',
  },
  {
    text: 'Flota',
    value: 'nom_flota',
  },
  {
    text: 'Patente del Vehículo',
    value: 'patente_vehiculo',
  },
  {
    text: 'Acciones',
    value: 'actions',
  },
];
