import Vue from 'vue';

type Actividad = {
  actividadExtendidaTipo: number; // 0
  actividadExtendidaValor: string; // ""
  actividadId: string; // "70000002"
  actividadTipoNombre: string; //"ACTUALIZACION PROGRAMADA"
  altura: number; //0
  codigoActividad: number; //20
  conductorId: number; //0
  distanciaAcumulada: number; //0
  distanciaRecorrida: number; //0
  fechaActividad: string; //"2019-08-30T17:10:17.5066667"
  fechaRecepcion: string; //"2019-08-30T17:10:17.5066667"
  gpsId: number; //2012
  gpsValid: number; //1
  hdop: number; //11
  heading: number; //299
  horasMotor: number; //0
  id: string; //"60001031"
  ignicion: number; //1
  latitud: number; //-33.5287
  longitud: number; //-70.6337
  nombreConductor: string; //""
  nombreProveedor: string; //"GPS Chile"
  nroSatelites: number; //8
  odometro: number; //181636
  orientacion: number; // 299
  patente: string; //""
  rutConductor: unknown; //null
  transmitiendo: boolean; //false
  ubicacion: string; //"Axity 60001031"
  unidad: string; //"KLFH34"
  vehiculoId: number; //2012
  velocidadActual: number; //271
  velocidadMaxima: number; //10
};

type ActividadesEncontradasParams = any[];
// TODO definir tipo
export type RepetirDiaActividad = any;

const events = {
  actividadesEncontradas: 'actividadesEncontradas',
};
const RDEventBusActividad = new Vue({
  methods: {
    actividadesEncontradas: function(
      actividades: ActividadesEncontradasParams,
      datosRepetirDia: RepetirDiaActividad
    ) {
      this.$emit(events.actividadesEncontradas, actividades, datosRepetirDia);
    },
    onActividadesEncontradas: function(
      callbackfn: (
        actividades: ActividadesEncontradasParams,
        datosRepetirDia: RepetirDiaActividad
      ) => void
    ) {
      this.$on(events.actividadesEncontradas, callbackfn);
    },
  },
});
export default RDEventBusActividad;
