export default Array.from({
  length: 3,
}).map((pautaActividad, index) => ({
  id: index,
  nombrePauta: 'Pauta N ' + index,
  descripcion: 'Esta es la descripcion',
  fechaModificacion: '2019-10-21T18:50:03',
  usuarioModificacion: 'efreire',
  estado: 1,
  tipoActividad: 1,
}));
