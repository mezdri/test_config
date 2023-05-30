export const makeGetRecepciones = length =>
  Array.from({
    length,
  }).map((recepcion, index) => ({
    id: index,
    clienteId: 1,
    proveedorId: 1,
    clienteProveedorId: 1,
    usuario: 'usuario1',
    password: 'password1',
    fechaIni: '2020-01-22T19:32:53.106Z',
    fechaFin: '2020-01-22T19:32:53.107Z',
    tiempoMinimo: index,
    cantidadBloque: index,
    estado: 0,
    usuarioCreadorId: 0,
    fechaCreacion: '2020-01-22T19:32:53.107Z',
    usuarioModificacionId: 0,
    fechaModificacion: '2020-01-22T19:32:53.107Z',
  }));
const getRecepciones = makeGetRecepciones(5);

export default getRecepciones;
