export const headers = [
  {
    headerName: 'Id Dispositivo',
    field: 'id_dispositivo',
    cellStyle: { textAlign: 'left' },
  },
  {
    headerName: 'Codigo del Vehículo',
    field: 'cod_vehiculo',
    cellStyle: { textAlign: 'left' },
  },
  {
    headerName: 'Nombre de Flota',
    field: 'nom_flota',
    cellStyle: { textAlign: 'left' },
  },
  {
    headerName: 'Esquema',
    field: 'esquema',
    cellStyle: { textAlign: 'left' },
  },
];

export const configTable = {
  headers: [
    {
      text: 'Id Dispositivo',
      align: 'left',
      sortable: true,
      value: 'id_dispositivo',
    },
    {
      text: 'Nro Serie',
      align: 'left',
      sortable: true,
      value: 'nro_serie',
    },
    {
      text: 'Sufijo Patente',
      align: 'left',
      sortable: true,
      value: 'suf_patente',
    },
    {
      text: 'Marca',
      align: 'left',
      sortable: false,
      value: 'marca',
    },
    {
      text: 'Patente',
      align: 'left',
      sortable: true,
      value: 'patente',
    },
    {
      text: 'Acciones',
      align: 'left',
      sortable: false,
    },
  ],
};
