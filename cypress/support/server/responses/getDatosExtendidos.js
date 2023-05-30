export const makeGetDatoExtendido = length =>
  Array.from({
    length,
  }).map((datoExtendido, index) => ({
    id: index,
    trama: 'Trama ' + index,
    posicion: index * 5,
    nombre: 'dato extendido ' + index,
    tipoMedidaId: 'Tipo de Medida ' + index,
    descripcion: 'Dato Extendido prueba',
    link: 'www.link.com',
    icono: '',
    fechaModificacion: '2020-01-22T19:32:53.106Z',
    usuarioModifica: 'usuario',
    fechaCreacion: '2020-01-22T19:32:53.106Z',
    usuarioCreador: 'usuario1',
  }));
const getDatoExtendido = makeGetDatoExtendido(4);

export default getDatoExtendido;
