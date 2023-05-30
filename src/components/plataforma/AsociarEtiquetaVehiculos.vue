<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="650">
      <v-card id="alinear">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialogConfirmacionClose = true">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Agregar Etiqueta(s) a Vehículo(s)</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text style="height:140px;">
          <v-form ref="form" v-model="validForm" lazy-validation>
            <v-layout row wrap class="light--text">
              <v-flex xs12>
                <span>
                  Se agregará a los Vehículos seleccionados las siguientes
                  Etiquetas:
                </span>
              </v-flex>
              <v-flex xs12>
                <v-autocomplete
                  v-model="etiquetaAsignadosModel"
                  prepend-icon="label"
                  :items="etiquetaRespaldo"
                  color="primary"
                  :clearable="true"
                  item-text="nombre"
                  chips
                  multiple
                  :deletable-chips="true"
                  item-value="id"
                  label="Etiqueta (s)"
                  @input="onEtiquetaInput"
                  @change="onEtiquetaChange"
                  v-validate="'required'"
                  :error-messages="errors.collect('etiqueta')"
                  data-vv-name="etiqueta"
                  required
                  no-data-text="Sin resultados"
                ></v-autocomplete>
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="white" depressed @click="closeModal(false)">
            <span style="color: #526da5">Cancelar</span>
          </v-btn>
          <v-btn color="primary" :disabled="!validForm" @click="grabar()"
            >Aceptar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="tituloAgregar"
      :mensaje="
        $t('mensajes.gridMensajes.asociar.mensaje', {
          las_cantidad_entidad_seleccionadas: ' los vehículos seleccionados ?',
        })
      "
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.gridMensajes.asociar.btnAceptar')"
      :textoBtnNo="$t('mensajes.gridMensajes.asociar.btnCancelar')"
    ></app-confirmacion>
    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.crear.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.crear.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, false)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.crear.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.crear.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import config from '../../config/index';

import HandleErrors from '../../config/handleErrors';
import Confirmation from '../../components/Confirmation.vue';
import { EstadoEntidad } from '../../config/enums';

import { IEtiqueta } from '../../interfaces/Vehiculos';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';

@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class AsociarEtiquetaVehiculos extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: 'Agregar Etiqueta(s)' }) titulo!: string;

  @Prop({ default: [] }) data!: any;

  $snotify: any;

  gridApi: any;
  columnsDefs: any = [];
  columnApi: any;
  dialog: boolean = false;

  validForm: boolean = false;
  dictionaryFormErrors: any = {};

  etiquetaAsignadosModel: any = [];
  etiquetaAsignados: IEtiqueta[] = [];
  etiquetaRespaldo: IEtiqueta[] = [];

  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;

  cont: number = 0;
  axContextoVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);

  tituloAgregar: string = "";

  mounted() {
    //this.initialize()
  }
  initialize() {
    this.cont = 0;
    this.getEtiquetas();

    this.dictionaryFormErrors = {
      custom: {
        etiqueta: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }
  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.etiquetaAsignados = [];
    this.etiquetaAsignadosModel = [];
    if (value) {
      this.$validator.reset();
      this.initialize();
    }
  }

  closeModal(val: boolean) {
    this.$emit('modalAsociacionEtiquetaEmit', false);
    this.show = false;
    this.dialogConfirmacion = false;
    this.dialog = false;
    this.$validator.errors.clear();
  }

  //  Grabar Etiquetas Asociacion /////////////////////////////////////////////////////////
  grabar() {
    this.$validator.validateAll().then(res => {
      if (res) {
        this.dialogConfirmacion = true;
      }
    });
  }
  grabarAsociacion() {
    this.data.forEach((item: any) => {
      this.grabarAsociacionesEtiqueta(item.id);
    });
  }

  grabarAsociacionesEtiqueta(idVehiculo: number) {
    let vehiculoEtiquetasModelListPost: any = [];
    if (this.etiquetaAsignados.length > 0) {
      let index = 0;
      let he = new HandleErrors();
      this.etiquetaAsignados.forEach((etiquetas: any) => {
        let etiquetaModel = etiquetas;
        etiquetaModel = {
          vehiculoEtiquetaId: etiquetas.id,
          vehiculoId: idVehiculo,
        };
        vehiculoEtiquetasModelListPost.push(etiquetaModel);
      });
      if (vehiculoEtiquetasModelListPost.length > 0) {
        this.axContextoVehiculo.http
          .post(
            'VehiculoEtiquetaVehiculo/asocia/',
            vehiculoEtiquetasModelListPost
          )
          .then(res => {
            this.closeSuccess();
          })
          .catch(error => {
            he.showError(error);
          });
      } else {
        this.closeSuccess();
      }
    } else {
      this.closeSuccess();
    }
  }

  closeSuccess() {
    this.cont++;
    if (this.cont === 1) {
      this.closeModal(false);
      this.$snotify.success(
        'Se han agregado las Etiquetas a los Vehículos con éxito'
      );
      // this.$snotify.success
      // (
      //     this.$t('mensajes.mensajesExito.crear', { entidad: 'Vehículo', creadoA: 'creado' })
      // )
    }
  }

  getEtiquetas() {
    this.axContextoVehiculo.http
      .get('VehiculoEtiqueta/' + this.getClienteID() + '/cliente')
      .then(res => {
        if (res !== null && res !== undefined) {
          this.etiquetaRespaldo = res.data;
          this.etiquetaRespaldo = this.etiquetaRespaldo.filter(
            x => x.estado != EstadoEntidad.Eliminado
          );
        }
      })
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al obtener etiquetas.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al obtener etiquetas.');
        }
      });
  }
  //Eventos Autocomplete
  onEtiquetaChange(obj: any) {
    if (obj != undefined && obj.length != this.etiquetaAsignados.length) {
      for (let x = this.etiquetaAsignados.length - 1; x >= 0; x--) {
        let borrar = true;
        for (let i = 0; i <= obj.length - 1; i++) {
          if (this.etiquetaAsignados[x].id == obj[i]) {
            borrar = false;
          }
        }
        if (borrar) {
          this.etiquetaAsignados.splice(x, 1);
        }
      }
    }

    if (this.etiquetaAsignados.length > 1) {
      this.tituloAgregar = "Agregar Etiquetas";
    } else {
      this.tituloAgregar = "Agregar Etiqueta"
    }
  }
  onEtiquetaInput(obj: any) {
    if (obj != undefined) {
      for (let i = 0; i <= obj.length - 1; i++) {
        let added = this.etiquetaAsignados.filter(x => x.id == obj[i]);
        if (added.length == 0) {
          let _obj = this.etiquetaRespaldo.filter(x => x.id == obj[i]);
          this.etiquetaAsignados.push(_obj[0]);
        }
      }
    }
  }
  //Util /////////////////////////////////////////////////////////////////////////////////
  getClienteID() {
    return localStorage.getItem('clienteDefecto');
  }

  //CallBack Confirmacion /////////////////////////////////////////////////////////////////
  confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    let he = new HandleErrors();

    if (val) {
      this.$validator.validateAll().then(res => {
        if (res) {
          this.grabarAsociacion();
        }
      });
    }
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    let he = new HandleErrors();
    if (val) {
      this.closeModal(false);
    }
    /*if (val) {
            this.$validator.validateAll().then((res) => {
                if (res) 
                {
                    this.closeModal(false);
                }
            })
        }*/
  }
}
</script>
<style>
#alinear {
  text-align: justify;
}
</style>
