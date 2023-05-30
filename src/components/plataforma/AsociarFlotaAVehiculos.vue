<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="650">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialogConfirmacionClose = true">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Asociar Vehículo(s) a Flota</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text style="height: 115px;">
          <v-form ref="form" v-model="validForm" lazy-validation>
            <v-layout row wrap class="light--text">
              <v-flex xs12>
                <span
                  >Los Vehículos seleccionados serán asociados a la siguiente
                  Flota:</span
                >
              </v-flex>
              <v-flex xs12>
                <v-autocomplete
                  :items="flota"
                  v-model="flotaSeleccionado"
                  prepend-icon="swap_vert"
                  color="primary"
                  :clearable="true"
                  item-text="nombre"
                  item-value="id"
                  label="Flota"
                  v-validate="'required'"
                  :error-messages="errors.collect('flotavehiculo')"
                  data-vv-name="flotavehiculo"
                  required
                  no-data-text="Sin resultados"
                ></v-autocomplete>
              </v-flex>
            </v-layout>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="white" depressed @click="closeModal(false)"
            ><span style="color: #526da5">Cancelar</span></v-btn
          >
          <v-btn color="primary" @click="grabar()" :disabled="!validForm"
            >Aceptar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="$t('mensajes.gridMensajes.asociar.titulo', { entidad: 'Flota' })"
      :mensaje="mensajeAsociar"
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
import {
  ServicioProxy,
  EstadoCompartirInformacion,
  TipoCompartir,
} from '@/config/enums';
import config from '../../config/index';
import HandleErrors from '../../config/handleErrors';
import Confirmation from '../../components/Confirmation.vue';
import { Funcionalidades } from '@/config/funcionalidades';
import { IVehiculo } from '../../interfaces/Vehiculos';
import { IFlota } from '../../interfaces/Flota';
import { Component, Prop, Emit, Watch } from 'vue-property-decorator';
import store from '@/store';

@Component({
  components: {
    'app-confirmacion': Confirmation,
  },
})
export default class AsociarFlotaAVehiculos extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: [] }) vehiculos!: IVehiculo[];

  $snotify: any;
  dialog: boolean = false;
  gridApi: any;
  columnsDefs: any = [];
  columnApi: any;

  validForm: boolean = false;
  dictionaryFormErrors: any = {};

  flotaSeleccionado: any = 0;
  flotaSeleccionadoAux: any = 0;
  flota: IFlota[] = [];

  flotaId: string = '';

  editedItem: IVehiculo[] = [];

  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;

  axContextoVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  handleErrors: HandleErrors = new HandleErrors();
  axiosAuth: AxiosVue = new AxiosVue(ServicioProxy.Auth);
  notificaEsCompartido: boolean = false;
  controllerVehiculo: string = 'Vehiculo';
  mensajeAsociar: any = '';

  initialize() {
    this.getFlotas();
    this.dictionaryFormErrors = {
      custom: {
        flotavehiculo: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);
  }

  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.flotaSeleccionado = 0; //20191014 AM - Observaciones Compartir Información
    this.flota = [];
    this.flotaId = '0';
    if (value) {
      this.$validator.reset();
      this.editedItem = this.vehiculos;
      this.initialize();
    }
  }

  closeModal(val: boolean) {
    this.$emit('modalAsociacionFlotaEmit', false);
    this.dialog = false;
    this.dialogConfirmacion = false;
    this.editedItem = [];
    this.$validator.errors.clear();
  }

  //  Grabar Etiquetas Asociacion /////////////////////////////////////////////////////////
  grabar() {
    this.$validator.validateAll().then(async res => {
      if (res) {
        await this.validaTodo();
      }
    });
  }

  //09-2019: Desarrollo Compartir Información
  async validaTodo() {
    if (this.vehiculos.length > 0) {
      this.mensajeAsociar = this.$t('mensajes.gridMensajes.asociar.mensaje', {
        las_cantidad_entidad_seleccionadas: ' los vehículos seleccionados ?',
      });

      if (this.vehiculos.length == 1) {
        const res: any = await this.axContextoVehiculo.http.get(
          `vehiculo/${
            this.vehiculos[0].id
          }/${config.getClienteSesion()}/vehiculoEsCompartido`
        );

        //Filtro Tipo Compartir Flota
        res.data = res.data.filter(
          (x: any) => x.compartirTipo === TipoCompartir.Flota
        );

        if (res.data.length === 1) {
          this.mensajeAsociar =
            'El Vehículo se encuentra actualmente compartido con el Cliente ' +
            res.data[0].compartidoPor +
            ', por lo que si desasocia el Vehículo el Cliente dejará de recibir información ¿Desea continuar?';
        } else if (res.data.length > 1) {
          this.mensajeAsociar =
            'El Vehículo se encuentra actualmente compartido con los Clientes ';

          const clientesCompartidos = [
            ...new Set(res.data.map((x: any) => x.compartidoPor)),
          ];
          clientesCompartidos.forEach((cli: any, idx: number) => {
            if (idx + 1 === clientesCompartidos.length) {
              this.mensajeAsociar += cli;
            } else if (idx + 1 === clientesCompartidos.length - 1) {
              this.mensajeAsociar += cli + ' y ';
            } else {
              this.mensajeAsociar += cli + ', ';
            }
          });

          this.mensajeAsociar +=
            ', por lo que si desasocia el Vehículo los Clientes dejarán de recibir información ¿Desea continuar?';
        }
      } else {
        let vehCompartidos: any = [];
        const res: any = await this.axContextoVehiculo.http.get(
          `vehiculo/0/${config.getClienteSesion()}/vehiculoEsCompartido`
        );

        //Filtro Tipo Compartir Flota
        res.data = res.data.filter(
          (x: any) => x.compartirTipo === TipoCompartir.Flota
        );

        this.vehiculos.forEach(async (veh: any) => {
          if (res.data.length > 0) {
            let vehiculoExiste: any = res.data.find(
              (x: any) => x.id === veh.id
            );

            if (vehiculoExiste !== undefined) {
              vehCompartidos.push(veh);
            }
          }
        });

        if (vehCompartidos.length > 0) {
          this.mensajeAsociar =
            'Existen Vehículos que se encuentran actualmente compartidos, por lo que si desasocia los Vehículos los Clientes dejarán de recibir información ¿Desea continuar?';
        }
      }
      this.dialogConfirmacion = true;
    }
  }
  //---

  //09-2019: Desarrollo Compartir Información
  async grabaAsociacionVehiculoFlota() {
    let vehiculosFlotaModelListPost: any = [];
    let vehiculosFlotaNotificacion: any = [];
    let model: number[] = [];
    let he = new HandleErrors();
    this.flotaSeleccionadoAux = this.flotaSeleccionado;

    this.vehiculos.forEach((item: any) => {
      if (this.flotaSeleccionado != item.flotaId) {
        let flotaModel: any = {};
        flotaModel = {
          flotaId: this.flotaSeleccionado,
          vehiculoId: item.id,
          clienteId: config.getClienteSesion(),
        };
        vehiculosFlotaModelListPost.push(flotaModel);
        vehiculosFlotaNotificacion.push({
          flotaId: item.flotaId,
          vehiculoId: item.id,
        });
        model.push(item.id);
      }
    });

    if (vehiculosFlotaModelListPost.length > 0) {
      //1. Se debe recorrer antes de asociar para identificar los vehiculos compartidos
      //20191014 AM - Observaciones Compartir Información - Se deben agupar los vehiculos por flota/cliente
      let flotasActualesCompartidas: any = [];
      const flotasActuales = [
        ...new Set(vehiculosFlotaNotificacion.map((x: any) => x.flotaId)),
      ];
      flotasActuales.forEach(async (f: any) => {
        this.axContextoVehiculo.http
          .get('flota/' + f + '/' + this.getClienteID() + '/flotaEsCompartido')
          .then(async res => {
            if (res.data.length > 0) {
              let vehiculosCompartidas = vehiculosFlotaNotificacion.filter(
                (x: any) => x.flotaId == f
              );
              if (vehiculosCompartidas.length > 0) {
                const vehiculosModel = vehiculosCompartidas.map(
                  (x: any) => x.vehiculoId
                );
                await this.enviarCorreoRemover(vehiculosModel, f);
              }
            }
          });
      });
      //---

      //2. Se asocian vehiculos a la nueva Flota
      await this.axContextoVehiculo.http
        .post('VehiculoFlota/asocia/', vehiculosFlotaModelListPost)
        .then(async res => {
          this.axContextoVehiculo.http
            .get(
              'flota/' +
                this.flotaSeleccionado +
                '/' +
                this.getClienteID() +
                '/flotaEsCompartido'
            )
            .then(async res => {
              if (res.data.length > 0) {
                //723 - Compartir Información - Editar Flota
                let numFlotaAceptada = res.data.length;
                if (res.data.length > 0) {
                  numFlotaAceptada = res.data.filter(
                    (x: any) =>
                      x.estadoCompInfo === EstadoCompartirInformacion.Aceptada
                  ).length;
                }
                //---

                if (numFlotaAceptada > 0) {
                  await this.enviarCorreoAgregar(
                    model,
                    this.flotaSeleccionadoAux
                  ); //Se envia correo si es Flota Seleccionada es Compartida
                }
              }
            });
          this.closeSuccess();
        })
        .catch(err => {
          this.handleErrors.showError(err);
        });
      //---
    } else {
      //[INTERNA - A0057] Vehículo - Asociar a Flota (por lote)
      this.closeSuccess();
    }
  }
  //---

  //  Obtiene Flotas  //////////////////////////////////////////////////////////////////
  getFlotas() {
    this.axContextoVehiculo.http
      .get('flota/cliente/' + this.getClienteID() + '/compartido/1') //0
      .then(res => {
        //20191014 AM - Observaciones Compartir Información
        //Si existen vehiculos compartidos (recibidos) no muestro flotas compartidas en el listado
        let hayCompartidos = this.vehiculos.filter(
          (x: any) => x.esCompartido === true
        );
        if (hayCompartidos.length > 0)
          this.flota = res.data.filter((x: any) => x.idCompartida === 0);
        else this.flota = res.data;
        //---
      })
      .catch(error => {});
  }

  //solo flotas aceptadas
  async esFlotaCompartida(flotaId: number) {
    this.axContextoVehiculo.http
      .get(
        'flota/' + flotaId + '/' + this.getClienteID() + '/flotaEsCompartido'
      )
      .then(res => {
        //723 - Compartir Información - Editar Flota
        let numFlotaAceptada = res.data.length;
        if (res.data.length > 0) {
          numFlotaAceptada = res.data.filter(
            (x: any) => x.estadoCompInfo === EstadoCompartirInformacion.Aceptada
          ).length;
        }
        //---

        if (numFlotaAceptada > 0) {
          this.notificaEsCompartido = true;
        }
      })
      .catch(error => {});
  }

  //Util /////////////////////////////////////////////////////////////////////////////////
  getClienteID() {
    return localStorage.getItem('clienteDefecto');
  }
  closeSuccess() {
    this.closeModal(false);
    this.$snotify.success('Se han asociado los Vehículos a la Flota con éxito');
  }
  //CallBack Confirmacion /////////////////////////////////////////////////////////////////
  confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    if (val) {
      this.$validator.validateAll().then(res => {
        if (res) {
          this.grabaAsociacionVehiculoFlota();
        }
      });
    }
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
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

  //09-2019: Desarrollo Compartir Información (Envio Correos Agregar)
  async enviarCorreoAgregar(vehiculosIds: number[], flotaId: number) {
    let modelEmail: any = {
      encodeIdUsuario: store.state.userId,
      from: '',
      to: '',
      subject: '',
      message: '',
      encodedFechaEnvio: '',
      url: '',
      idEntidad: flotaId,
      clienteUsuariosId: 0,
      funcionalidad: TipoCompartir.Flota,
      identificadorId: flotaId,
      compartirInformacionId: 0,
      vehiculosIds: vehiculosIds,
    };
    const res: any = await this.axiosAuth.http.post(
      `Email/AgregarVehiculos`,
      modelEmail
    );
  }

  //09-2019: Desarrollo Compartir Información (Envio Correos Remover)
  async enviarCorreoRemover(vehiculosIds: number[], flotaId: number) {
    let modelEmail: any = {
      encodeIdUsuario: store.state.userId,
      from: '',
      to: '',
      subject: '',
      message: '',
      encodedFechaEnvio: '',
      url: '',
      idEntidad: flotaId,
      clienteUsuariosId: 0,
      funcionalidad: TipoCompartir.Flota,
      identificadorId: flotaId,
      compartirInformacionId: 0,
      vehiculosIds: vehiculosIds,
    };

    const res: any = await this.axiosAuth.http.post(
      `Email/RemoverVehiculos`,
      modelEmail
    );
  }
}
</script>
