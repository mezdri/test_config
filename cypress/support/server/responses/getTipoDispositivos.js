export const makeGetTipoDispositivo = length =>
  Array.from({
    length,
  }).map((tipoDispositivo, index) => ({
    id: index,
    nombre: 'Tipo dispositivo ' + index,
    descripcion: 'Descripcion tipo dispositivo ' + index,
    marca: 'Marca',
    modelo: 'Modelo',
    fechaCreacion: '2020-01-14T12:52:20.8163239',
    usuarioModificacionId: null,
    fechaModificacion: null,
    usuarioCreador: 'jorge.farias@axity.com',
    fechaCreacionTxt: '14/01/2020',
    usuarioModifica: null,
    fechaModificacionTxt: '',
  }));
const getTipoDispositivo = makeGetTipoDispositivo(5);

export default getTipoDispositivo;
