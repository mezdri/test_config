<template>
  <v-layout row justify-center>
    <v-dialog persistent width="450" max-width="450" style="top: 20px">
      <div
        class="text-xs animated fadeIn fast"
        style="border: 1px solid #f5f5f5"
        id="divCortaCorriente"
        v-show="dialog"
      >
        <v-card style="width: 290px;">
          <v-toolbar align="left" card prominent style="height: 37px;">
            <v-btn
              small
              icon
              style="margin-top: -28px;"
              @click="
                closeModal();
                actualizaAuxiliar();
              "
            >
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title
              style="color:rgba(0,0,0,0.54); padding-bottom:25px; "
              >Corta Corriente</v-toolbar-title
            >
          </v-toolbar>
          <v-card-title>
            <v-form ref="form" lazy-validation>
              <v-spacer></v-spacer>

              <v-layout row wrap align="center" style="padding-left: 10px;">
                <v-radio-group row v-model="radios" @change="reqEstatus()">
                  <label>Activar</label>
                  <v-radio
                    color="success"
                    style="padding-bottom:5px; padding-left:10px;"
                    value="6"
                  ></v-radio>

                  <label>Desactivar</label>
                  <v-radio
                    color="success"
                    style="padding-bottom:5px; padding-left:10px;"
                    value="7"
                  ></v-radio>
                </v-radio-group>
              </v-layout>
              <v-layout align="center">
                <v-flex md4>
                  <v-text-field
                    label="Solicitud"
                    v-model="datacomunicacion.mensajeTxt"
                    type="text"
                    readonly
                  ></v-text-field>
                </v-flex>
                <v-flex md8>
                  <v-text-field
                    md6
                    label="Fecha Envío"
                    v-model="datacomunicacion.fechaSolicitudTxt"
                    readonly
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout align="center">
                <v-flex>
                  <v-text-field
                    label="Estado"
                    type="text"
                    v-model="datacomunicacion.estadoTxt"
                    readonly
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout>
                <v-flex>
                  <v-text-field
                    label="Usuario"
                    type="text"
                    v-model="datacomunicacion.usuarioTxt"
                    readonly
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout v-show="accionComunicaciones.visible">
                <v-flex align="rigth" xs3 offset-xs9 align-end>
                  <a href="#" @click="verDetalleVehiculo()">Ver Detalle ></a>
                </v-flex>
              </v-layout>
            </v-form>
          </v-card-title>
        </v-card>
      </div>
    </v-dialog>
    <!-- <app-detalle-vehiculo-home
      :show="showDetalleVehiculo"
      :vehiculoId="vehiculoId"
      :center="true"
      :swicthRepetirDiaDetalle="switchRepetirDia"
      :model="repetirDiaVm"
      :tabModel="tabModel"
      v-on:modalAsociacionEmit="detalleActModalCallback($event)"
    ></app-detalle-vehiculo-home> -->
    <app-confirmacion
      :show="dialogConfirmar"
      :titulo="tituloConfirmar"
      :mensaje="mensajeConfirmar"
      v-on:modalConfirmationEmit="cancelarCallback($event)"
      :textoBtnSi="$t('mensajes.crud.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.crear.btnCancelar')"
      :width="450"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Vehiculo } from '../pantallas/Inicio/VehiculosData/fetchVehiculos';
import { RepetirDiaVm } from '@/interfaces/RepetirDiaVm';
import { AxiosVue } from '@/AxiosVue';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ServicioProxy, EstadoEnvioGps } from '@/config/enums';
import ActividadesEventBus from '@/eventBus/actividadesEventBus';
// import ActividadDetalleVehiculoHome from '@/components/ActividadDetalleVehiculo.vue';
import Confirmation from '@/components/Confirmation.vue';
import store from '@/store';
import CortaCorrienteEventBus from '@/pantallas/Inicio/CortaCorrienteData/CortaCorrienteEventBus';
import {
  codigoAccionesMenuItem,
  CodigoAccion,
  PermisoAccion,
} from '@/views/base/VariablesPermisos';
import { ComponenteBase } from '../views/base/ComponenteBase';
import { Funcionalidades } from '@/config/funcionalidades';
import vehiculoEventBus from '../pantallas/Inicio/VehiculosGrid/vehiculoEventBus';
import { Actividad } from '../pantallas/Inicio/ActividadesData/fetchActividades';
import ActividadEventBus from '../pantallas/Inicio/ActividadesData/ActividadEventBus';

@Component({
  components: {
    // 'app-detalle-vehiculo-home': ActividadDetalleVehiculoHome,
    'app-confirmacion': Confirmation,
  },
})
export default class CorteIgnicion extends ComponenteBase {
  funcionalidad: Funcionalidades = Funcionalidades.Inicio;

  @Prop({ default: false }) show!: any;

  dialog: boolean = false;
  $snotify: any;
  tituloConfirmar: string = '';
  mensajeConfirmar: string = '';
  radios: any = null;
  switchRepetirDia: boolean = false;
  datacomunicacion: any = [];
  dialogConfirmar: boolean = false;
  showVerDetalleVehiculo: boolean = false;
  cortaCorrienteController: string = 'CortaCorriente';
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  vehiculoId: number = 0;
  showDetalleVehiculo: boolean = false;
  tabModel: string = '';
  msjDin: string = '';
  repetirDiaVm: RepetirDiaVm = {};
  actividadSeleccionada: any;
  vehiculoData: any = {};
  vehiculo: Vehiculo = null;
  // actividades: Actividad = null;
  ultimaActividad: Actividad = null;
  numClick: number = 0;

  //Permisos
  accionComunicaciones: PermisoAccion = {
    accionCodigo: CodigoAccion.Comunicaciones,
    visible: false,
  };
  accionesTotales: PermisoAccion[] = [this.accionComunicaciones];

  @Watch('show')
  async onPropertyChanged(value: any, oldValue: boolean) {
    this.datacomunicacion = value.dataComunicacion;
    // this.actividades = value.actividad;
    this.ultimaActividad = value.ultimaActividad;
    this.vehiculo = value.vehiculo;
    this.dialog = value.show;
    this.radios = null;
  }

  created() {
    const self = this;
    //obtengo el id del vehiculo desde el grid del homegrid
    ActividadesEventBus.$on('idDirecto', (vehiculo: any) => {
      this.vehiculoData = vehiculo;
      this.vehiculoId = vehiculo.id;

      this.repetirDiaVm = {
        fechaRecepcion: vehiculo.ultimaActividad.fechaRecepcion,
        ubicacion: vehiculo.ultimaActividad.ubicacion,
        latitud: vehiculo.ultimaActividad.latitud,
        longitud: vehiculo.ultimaActividad.longitud,
        velocidadActual: vehiculo.ultimaActividad.velocidadActual,
        velocidadMaxima: 0,
        patente: vehiculo.patente,
        unidad: vehiculo.unidad,
        nombreConductor:
          (vehiculo.ultimaActividad.nombreConductor || '').trim().length === 0
            ? vehiculo.nombreConductor
            : vehiculo.ultimaActividad.nombreConductor,
        gpsId: vehiculo.ultimaActividad.gpsId,
        ignicion: vehiculo.ultimaActividad.ignicion,
        transmitiendo: vehiculo.ultimaActividad.transmitiendo,
        rutConductor:
          (vehiculo.ultimaActividad.rutConductor || '').trim().length === 0
            ? vehiculo.rutConductor
            : vehiculo.ultimaActividad.rutConductor,
      };
    });
    store.commit('setRepetirDiaAbierto', false);
    CortaCorrienteEventBus.onAbrirCortaCorriente((params: any) => {
      this.datacomunicacion = params;
    });
    var actividad = this.vehiculoData;
    if (this.$store.getters.getRepetirDiaAbierto.repetirDiaAbierto) {
      store.commit('setGenerandoRuta', true);
      store.commit('setClickDetalle', { actividad, openInfoWindow: false });
      this.actividadSeleccionada = actividad;
    }
  }

  verDetalleVehiculo() {
    this.closeModal();
    const pintarRepetirDia: any = this.$store.getters.getRepetirDiaAbierto;
    this.switchRepetirDia =
      pintarRepetirDia && pintarRepetirDia.repetirDiaAbierto === true;
    ActividadesEventBus.$emit('ctaId', {
      vehiculoId: this.vehiculoId,
    });
    ActividadEventBus.actualizarActividad();
    const v: Vehiculo = this.$store.getters.getVehiculo;
    this.tabModel = '2';
    vehiculoEventBus.abrirDetalleVehiculo(
      this.vehiculo,
      this.$store.getters.getActividadSeleccionada.actividadSeleccionada,
      this.ultimaActividad,
      true,
      this.tabModel
    );
  }
  closeModal() {
    store.commit('setCortaCorrienteAbierto', false);
    this.dialog = false;
    // this.vehiculoId = 0;
    this.radios = null;
  }
  actualizaAuxiliar() {
    store.commit('setCortaCorrienteAbiertoAux', false);
  }
  detalleActModalCallback() {
    document.getElementsByTagName('html')[0].style.overflow = 'auto';
    this.showDetalleVehiculo = false;
  }
  async cancelarCallback(params: any) {
    this.dialogConfirmar = false;
    let err = '0';
    if (params) {
      this.numClick++;
      if (this.numClick === 1) {
        const loadingKey = 'cancelarCallbackCC';
        this.loadingService.showLoading(undefined, loadingKey);
        var model = {};
        var modelVm = {};
        await this.axiosVehiculo.http
          .get(
            `${this.cortaCorrienteController}/${this.show.vehiculoId}/GetModel` //genera modelo para comunicarse con servicio de integracion
          )
          .then(res => {
            var a = res;
            model = {
              idPlataforma: 1,
              idVehiculo: this.show.vehiculoId,
              idModeloGps: a.data.idModeloGps,
              imei: a.data.imei,
              activar: this.radios,
              idUsuario: this.show.usuarioId,
            };

            modelVm = {
              vehiculoId: this.show.vehiculoId,
              idModeloGps: a.data.idModeloGps,
              imei: a.data.imei,
              gpsId: a.data.gpsId,
              tipoMensajeId: this.radios,
            };
          });

        //Graba en tabla Comunicación
        var idComunicacion = 0;
        await this.axiosVehiculo.http
          .post(`${this.cortaCorrienteController}/GrabaComunicacion`, modelVm)
          .then(res => {
            if (res.data !== undefined) {
              idComunicacion = res.data.id;
            }
          })
          .catch(error => {
            err = '500';
            this.$snotify.error(
              `Ha ocurrido un problema al solicitar la ${this.msjDin} del Corta Corriente `
            );
            this.radios = null;
          });
        //---

        if (err !== '500') {
          this.axiosVehiculo.http
            //.post(`${this.cortaCorrienteController}/CortaCorriente`, model)
            .post(
              `${this.cortaCorrienteController}/CortaCorriente/${idComunicacion}`
            )
            .then(x => {
              this.$snotify.success(
                `Solicitud de ${this.msjDin} Corta Corriente fue enviada de forma exitosa  `
              );
              ActividadEventBus.actualizarActividad();
              this.radios = null;
            })
            .catch(error => {
              this.$snotify.success(
                `Solicitud de ${this.msjDin} Corta Corriente fue enviada de forma exitosa  `
              );
              ActividadEventBus.actualizarActividad();
              this.radios = null;
              /*if (error.response.status == '500') {
                err = error.response.status;
                this.$snotify.error(
                  `Ha ocurrido un problema al solicitar la ${this.msjDin} del Corta Corriente `
                );
              } else {
                this.$snotify.success(
                  `Solicitud de ${this.msjDin} Corta Corriente fue enviada de forma exitosa  `
                );
                ActividadEventBus.actualizarActividad();
              }
              this.radios = null;*/
            })
            .finally(() => {
              if (err != '500') {
                this.axiosVehiculo.http
                  .get(
                    `${this.cortaCorrienteController}/${this.vehiculoId}/GetUltimoComunicacion`
                  )
                  .then(x => {
                    if (x.data !== undefined) {
                      this.datacomunicacion = x.data; // se resetean valores de modal con ultima actualizacion de comunicacion
                      if (this.datacomunicacion.id) {
                        this.datacomunicacion.solicitudTxt = this.datacomunicacion.solicitudTxt.replace(
                          /([a-z])([A-Z])/g,
                          '$1 $2 '
                        );
                        this.datacomunicacion.estadoTxt = EstadoEnvioGps[
                          this.datacomunicacion.estadoId
                        ].replace(/_/g, ' ');
                      }
                    }
                  });
                this.axiosVehiculo.http.post(
                  `${this.cortaCorrienteController}/auditoria`,
                  model
                );
              }
              setTimeout(() => {
                this.loadingService.hideLoading(loadingKey);
              }, 1000);
            });
        } else {
          setTimeout(() => {
            this.loadingService.hideLoading(loadingKey);
          }, 1000);
        }
      } else {
        return;
      }
    } else {
      this.numClick = 0;
      this.radios = null;
    }
  }
  reqEstatus() {
    this.numClick = 0;
    this.msjDin = this.radios == 6 ? 'activación' : 'desactivación';
    let msjDinMay = this.radios == 6 ? 'Activar' : 'Desactivar';
    let msj =
      this.radios == 6
        ? 'activar el Corta Corriente?, Esta acción impedirá la partida del vehículo.'
        : 'desactivar el Corta Corriente?, Esta acción permitirá la partida del vehículo.';
    this.tituloConfirmar = `${msjDinMay} Corta Corriente`;
    this.mensajeConfirmar = `¿Está seguro que desea ${msj}`;
    this.dialogConfirmar = true;
  }
}
</script>
<style>
#alinear {
  text-align: justify;
}
#divCortaCorriente {
  font-family: 'Asap', sans-serif !important;
  font-weight: '14' !important;
  width: 85%;
}
</style>
