export const makeGetTipoMedida = length =>
  Array.from({
    length,
  }).map((tipoMedida, index) => ({
    id: index,
    nombre: 'Tipo Medida ' + index,
    sigla: 'cm',
    descripcion: 'Tipo Medida 1',
    fechaCreacion: '2020-01-14T12:52:20.8163239',
    usuarioModificacionId: null,
    fechaModificacion: null,
    usuarioCreador: 'jorge.farias@axity.com',
    fechaCreacionTxt: '14/01/2020',
    usuarioModifica: null,
    fechaModificacionTxt: '',
  }));
const getTipoMedida = makeGetTipoMedida(5);

export default getTipoMedida;
