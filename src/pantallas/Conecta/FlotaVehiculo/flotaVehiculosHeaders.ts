export const headers = [
  {
    text: 'Codigo del Vehículo',
    field: 'cod_vehiculo',
    cellStyle: { textAlign: 'left' },
  },
  {
    text: 'Nombre de Flota',
    field: 'nom_flota',
    cellStyle: { textAlign: 'left' },
  },
  {
    text: 'Cliente',
    field: 'cliente',
    cellStyle: { textAlign: 'left' },
  },
  {
    text: 'Patente del Vehículo',
    field: 'patente_vehiculo',
    cellStyle: { textAlign: 'left' },
  },
];

export const configTable = {
  headers: [
    {
      text: 'Codigo del Vehículo',
      align: 'left',
      sortable: true,
      value: 'cod_vehiculo',
    },
    {
      text: 'Nombre de Flota',
      align: 'left',
      sortable: true,
      value: 'nom_flota',
    },
    {
      text: 'Cliente',
      align: 'left',
      sortable: true,
      value: 'cliente',
    },
    {
      text: 'Patente del Vehículo',
      align: 'left',
      sortable: true,
      value: 'patente_vehiculo',
    },
  ],
};
