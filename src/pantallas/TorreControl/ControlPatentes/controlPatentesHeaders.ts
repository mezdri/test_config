export let headers = [
  {
    headerName: 'Flota',
    field: 'flota',
    sortable: true,
    resizable: true,
    width: 200,
    lockPinned: true,
    hide: false,
  },
  {
    headerName: 'Patente',
    field: 'patente',
    sortable: true,
    resizable: true,
    width: 200,
    lockPinned: true,
    hide: false,
  },
  {
    headerName: 'AVL',
    field: 'avl',
    sortable: true,
    resizable: true,
    width: 200,
    lockPinned: true,
    hide: true,
  },
  {
    headerName: 'COD. VEHÍCULO',
    field: 'cod_vehiculo',
    sortable: true,
    resizable: true,
    width: 200,
    lockPinned: true,
    hide: true,
  },
  /*{
        headerName: 'Gps',
        field: 'marca',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
    },
    {
        headerName: 'Camaras',
        field: 'last_activity',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
    },*/
  /*{
        headerName: 'Estado',
        field: 'estado',
        sortable: true,
        resizable: true,
        minWidth: 80,
        lockPinned: true,
        cellRenderer: (params: any) => {
            console.log(params);
            return `<i class="material-icons"  style="width: 24px; height: 24px; margin-top: 20px; border-radius: 50%; background: ${params.value}"></i>`;
        },
        cellStyle: {
            cursor: 'pointer',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'flex-start',
        },
    },*/
];
