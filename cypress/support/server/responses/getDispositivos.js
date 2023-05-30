import getDatoExtendido from './getDatosExtendidos';
export const makeGetDispositivos = length =>
  Array.from({
    length,
  }).map((dispositivo, index) => ({
    id: index,
    estado: 1,
    nombre: 'dispositivo ' + index,
    descripcion: 'Dispositivo prueba',
    tipoDispositivoId: 1,
    icono: '',
    isGps: false,
    isGpsText: 'No',
    marca: 'marca',
    modelo: 'modelo',
    dispositivoCampoVm: [],
    fechaModificacion: '2020-01-22T19:32:53.106Z',
    usuarioModifica: 'usuario',
    fechaCreacion: '2020-01-22T19:32:53.106Z',
    usuarioCreador: 'usuario1',
  }));
const getDispositivos = makeGetDispositivos(4);
getDispositivos.push({
  id: 4,
  estado: 1,
  nombre: 'dispositivo ' + 4,
  descripcion: 'Dispositivo prueba',
  tipoDispositivoId: 1,
  icono: '',
  isGps: true,
  isGpsText: 'Si',
  marca: 'marca',
  modelo: 'modelo',
  dispositivoCampoVm: getDatoExtendido,
  fechaModificacion: '2020-01-22T19:32:53.106Z',
  usuarioModifica: 'usuario',
  fechaCreacion: '2020-01-22T19:32:53.106Z',
  usuarioCreador: 'usuario1',
});
export default getDispositivos;
