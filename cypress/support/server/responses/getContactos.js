export default {
  contactos: [
    {
      nombre: 'Pablo Pérez',
    },
    {
      nombre: 'Enrique Hernandez',
    },
  ].map((contacto, index) => ({
    email: 'contacto@gpschile.cl',
    telefono: '+569 123 412 34',
    empresa: 'GPS Chile',
    tipoId: 1,
    tipoNombre: 'Temporal',
    codigo: index + 1,
    codigoCliente: 123,
    ...contacto,
  })),
};
