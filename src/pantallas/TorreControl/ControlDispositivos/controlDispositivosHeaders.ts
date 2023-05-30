export const headers = [
  {
    headerName: 'Código Vehículo',
    field: 'cod_vehiculo',
    sortable: true,
    resizable: true,
    minWidth: 80,
    lockPinned: true,
    sort: 'desc',
    cellStyle: {
      cursor: 'pointer',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'flex-start',
    },
  },
  {
    headerName: 'Flota',
    field: '__nom_flota',
    sortable: true,
    resizable: true,
    minWidth: 80,
    lockPinned: true,
    cellStyle: {
      cursor: 'pointer',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'flex-start',
    },
  },
  {
    headerName: 'Grupo',
    field: '__desc_grupo_vehiculo',
    sortable: true,
    resizable: true,
    minWidth: 80,
    lockPinned: true,
    cellStyle: {
      cursor: 'pointer',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'flex-start',
    },
  },
  {
    headerName: 'Dispositivo',
    field: 'id_dispositivo',
    sortable: true,
    resizable: true,
    minWidth: 80,
    lockPinned: true,
    cellStyle: {
      cursor: 'pointer',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'flex-start',
    },
  },
  {
    headerName: 'Tipo Dispositivo',
    field: 'tipo_dispositivo',
    sortable: true,
    resizable: true,
    minWidth: 80,
    lockPinned: true,
    cellStyle: {
      cursor: 'pointer',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'flex-start',
    },
  },
  {
    headerName: 'Marca',
    field: 'marca',
    sortable: true,
    resizable: true,
    minWidth: 80,
    lockPinned: true,
    cellStyle: {
      cursor: 'pointer',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'flex-start',
    },
  },
  {
    headerName: 'Fecha Última Activdad',
    field: 'fecha_ult_evento',
    sortable: true,
    resizable: true,
    minWidth: 80,
    lockPinned: true,
    cellStyle: {
      cursor: 'pointer',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'flex-start',
    },
  },
  {
    headerName: 'Estado Dispositivo',
    field: 'estado',
    sortable: true,
    resizable: true,
    minWidth: 80,
    lockPinned: true,
    cellRenderer: (params: any) => {
      var eButton = document.createElement('i');
      eButton.setAttribute(
        'title',
        `Hdop: ${params.data.hdop_ult_act}\n` +
          `Nro Satelites ${params.data.num_sat_ult_act}`
      );
      eButton.innerHTML = `<i class="material-icons"  style="width: 24px; height: 24px; margin-top: 20px; border-radius: 50%; background: ${params.value}"></i>`;
      return eButton;
    },
    cellStyle: {
      cursor: 'pointer',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'flex-start',
    },
  },
  {
    headerName: 'Estado',
    field: 'estado_exp',
    sortable: true,
    resizable: true,
    minWidth: 80,
    lockPinned: true,
    hide: true,
    supressToolPanel: true,
    cellStyle: {
      cursor: 'pointer',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'flex-start',
    },
  },
];
