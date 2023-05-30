export const makeGetDescargas = length =>
  Array.from({
    length,
  }).map((recepcion, index) => ({
    clienteProveedor: 'string',
    proveedor: 'Proveedor GPS 1',
    estadoTxt: 'string',
    fechaModificacionTxt: 'string',
    fechaCreacionTxt: 'string',
    id: index,
    clienteId: 1,
    clienteProveedorId: 1,
    proveedorId: 1,
    usuario: 'string',
    password: 'string',
    fechaIni: '2020-02-19T20:44:23.762Z',
    fechaFin: '2020-02-19T20:44:23.762Z',
    maxPeticionesDia: 0,
    maxPeticionesHora: 0,
    maxRegistrosBloque: 0,
    estado: 0,
    usuarioCreacion: 'string',
    fechaCreacion: '2020-02-19T20:44:23.762Z',
    usuarioModificacion: 'string',
    fechaModificacion: '2020-02-19T20:44:23.762Z',
  }));
const getDescargas = makeGetDescargas(5);

export default getDescargas;
