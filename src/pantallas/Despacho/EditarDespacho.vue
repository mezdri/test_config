<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivTV">
        <v-toolbar dark color="primary" fixed>
          <v-btn
            icon
            dark
            @click="
              !esEdicion ? closeModal(false) : (dialogConfirmacionClose = true)
            "
            :disabled="btnBloquear"
          >
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title>{{
            esEdicion ? 'Editar Despacho' : 'Ver Detalle Despacho'
          }}</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              @click="grabarEdicion()"
              class="btn-grabar"
              v-if="esEdicion"
              :disabled="!validForm || btnBloquear || btnBloquearGuardado"
              >Guardar Cambios</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>
        <br /><br /><br />
        <div>
          <div align="center" class="cardnew">
            <br />
            <v-flex md10>
              <v-card class="rounded-card">
                <v-form
                  ref="form"
                  v-model="validForm"
                  lazy-validation
                  class="col-md-12"
                >
                  <v-container grid-list-md>
                    <div align="left">
                      <v-flex md12>
                        <h2
                          class="h2_title"
                          style="margin-top: 12px !important"
                        >
                          {{
                            esEdicion
                              ? 'Editar Despacho'
                              : 'Ver Detalle Despacho'
                          }}
                        </h2>
                      </v-flex>
                    </div>
                    <v-divider></v-divider>
                    <br />
                    <v-layout wrap>
                      <v-flex xs4 sm4 md4>
                        <v-text-field
                          :label="formFields.codigo.label"
                          v-model="formFields.codigo.value"
                          :disabled="true"
                          :counter="80"
                          v-validate="'max:80'"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs4 sm4 md4>
                        <DatePicker
                          :label="formFields.fechaEnvio.label"
                          v-model="formFields.fechaEnvio.value"
                          data-vv-name="fechaEnvioRequerida"
                          :error-messages="
                            errors.collect('fechaEnvioRequerida')
                          "
                          :disabled="true"
                        />
                      </v-flex>
                      <v-flex xs4 sm4 md4>
                        <v-text-field
                          :label="formFields.usuario.label"
                          v-model="formFields.usuario.value"
                          :disabled="true"
                          :counter="80"
                          v-validate="'max:80'"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs4 sm4 md4>
                        <v-autocomplete
                          :label="formFields.courier.label"
                          v-model="formFields.courier.value"
                          :items="courrierList"
                          item-text="configvalor"
                          item-value="configid"
                          :disabled="true"
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs4 sm4 md4>
                        <v-text-field
                          :label="formFields.ordenSeguimiento.label"
                          v-model="formFields.ordenSeguimiento.value"
                          :disabled="true"
                          :counter="50"
                          v-validate="'max:50'"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs4 sm4 md4>
                        <v-autocomplete
                          v-model="formFields.localidad.value"
                          :label="formFields.localidad.label"
                          :items="localidadList"
                          item-text="locaname"
                          item-value="locaname"
                          :disabled="true"
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs4 sm4 md4>
                        <v-autocomplete
                          v-model="formFields.coordinador.value"
                          :label="formFields.coordinador.label"
                          :items="coordinadorList"
                          item-text="coorname"
                          item-value="coorname"
                          :disabled="true"
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs4 sm4 md4>
                        <v-autocomplete
                          v-model="formFields.tecnico.value"
                          :label="formFields.tecnico.label"
                          :items="tecnicoList"
                          item-text="tecniconame"
                          item-value="tecniconame"
                          :disabled="true"
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs4 sm4 md4>
                        <v-text-field
                          :label="formFields.observacion.label"
                          v-model="formFields.observacion.value"
                          :disabled="true"
                          :counter="100"
                          v-validate="'max:100'"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs1 sm1 md1>
                        <v-checkbox
                          v-model="formFields.costo.value"
                          :label="formFields.costo.label"
                          :disabled="true"
                        ></v-checkbox>
                      </v-flex>
                      <v-flex xs3 sm3 md3>
                        <v-text-field
                          :label="formFields.valor.label"
                          v-model="formFields.valor.value"
                          :disabled="true"
                          :counter="50"
                          type="Number"
                          v-validate="'max:50'"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs4 sm4 md4>
                        <DatePicker
                          :label="formFields.fechaRecepcion.label"
                          v-model="formFields.fechaRecepcion.value"
                          data-vv-name="fechaRecepcionRequerida"
                          :error-messages="
                            errors.collect('fechaRecepcionRequerida')
                          "
                          :disabled="!esEdicion || existeFechaR"
                        />
                      </v-flex>
                      <v-flex xs4 sm4 md4>
                        <v-text-field
                          :label="formFields.receptor.label"
                          v-model="formFields.receptor.value"
                          :disabled="!esEdicion || existereceptor"
                          :counter="50"
                          v-validate="'max:50'"
                        ></v-text-field>
                      </v-flex>

                      <v-flex xs4 sm4 md4>
                        <v-autocomplete
                          :label="formFields.anular.label"
                          v-model="formFields.anular.value"
                          :items="formFields.anular.items"
                          :disabled="!esEdicion || anulado"
                        ></v-autocomplete>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-form>
              </v-card>
            </v-flex>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <app-confirmacion
      :show="dialogConfirmacion"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'Módulo',
        })
      "
      :mensaje="mensajeConfirmacion"
      v-on:modalConfirmationEmit="confirmCallback($event)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import DatePicker from '@/reusable/Form/DatePicker.vue';
import moment from 'moment';
import Vue from 'vue';
import { fetchDespacho } from './fetchDespacho';
import { AxiosVue } from '@/AxiosVue'; //
import { LoadingService } from '@/services/loadingService';
import { ServicioProxy } from '@/config/enums'; //
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Funcionalidades } from '@/config/funcionalidades';
import { EstadoEntidad } from '@/config/enums';
import Confirmation from '@/components/Confirmation.vue'; //
import { TranslateResult } from 'vue-i18n';
import { GridApi } from 'ag-grid-community';

@Component({
  components: {
    DatePicker,
    'app-confirmacion': Confirmation,
  },
})
export default class EditarDespacho extends Vue {
  @Prop({ default: false }) courrierList!: any;
  @Prop({ default: false }) coordinadorList!: any;
  @Prop({ default: false }) localidadList!: any;
  @Prop({ default: false }) tecnicoList!: any;
  @Prop({ required: true }) usuarioActivo: any;

  @Prop({ default: false }) edited!: any;
  //@Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  accion!: any;
  ordesList2: any;
  data: any = {};
  btnBloquearGuardado: boolean = false;

  async getDespachoSeleccionado() {
    let self = this;
    this.loadingService.showLoading();
    return fetchDespacho({ despanumero: this.edited }, 'conectaDespacho/inicio')
      .then((data: any) => {
        //console.log(data.data.data);
        if (data.data.CODIGO_RESPUESTA == '1') {
          return data.data.data.LISTA;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return [];
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        this.loadingService.hideLoading();
        return null;
      });
  }
  anulado: boolean = false;
  existereceptor: boolean = false;
  existeFechaR: boolean = false;
  async getDespacho() {
    this.ordesList2 = (await this.getDespachoSeleccionado()) || [];
    this.data = this.ordesList2[0];
    this.formFields.usuario.value = this.data.nombre;
    this.formFields.codigo.value = this.data.despanumero;
    this.formFields.ordenSeguimiento.value = this.data.despaseguimiento;
    this.formFields.tecnico.value = this.data.tecniconame;
    this.formFields.coordinador.value = this.data.coorname;
    this.formFields.localidad.value = this.data.locaname;
    this.formFields.courier.value = this.data.despacourrier;
    this.formFields.observacion.value = this.data.despaobs;
    this.formFields.valor.value = this.data.despacargo_valor;
    this.formFields.costo.value =
      this.data.despacargo_sino == '1' ? true : false;
    this.formFields.fechaEnvio.value = moment(this.data.despafecha_envia);
    if (this.data.despafecha_recibe != '') {
      this.existeFechaR = true;
      this.formFields.fechaRecepcion.value = moment(
        this.data.despafecha_recibe
      );
    } else {
      this.existeFechaR = false;
    }
    if (this.data.despareceptor != '') {
      this.formFields.receptor.value = this.data.despareceptor;
      this.existereceptor = true;
      console.log(this.existereceptor);
    } else {
      this.existereceptor = false;
    }
    if (this.data.case == 'ANULADO') {
      this.formFields.anular.value = 'ANULADO';
      this.anulado = true;
      this.existereceptor = true;
      this.existeFechaR = true;
      this.btnBloquearGuardado = true;
    } else {
      this.formFields.anular.value = 'VIGENTE';
    }
  }

  mounted() {
    this.getDespacho();
  }

  onModelUpdated() {
    if (!this.gridApi) {
      return;
    }
  }

  onSelectionChanged(params: any) {}

  formFields: {
    codigo: any;
    fechaEnvio: any;
    usuario: any;
    courier: any;
    ordenSeguimiento: any;
    localidad: any;
    coordinador: any;
    tecnico: any;
    referencia: any;
    observacion: any;
    costo: any;
    valor: any;
    fechaRecepcion: any;
    receptor: any;
    anular: any;
  } = {
    codigo: {
      label: 'Código',
      value: '',
    },
    fechaEnvio: {
      label: 'Fecha Envio',
      value: moment(),
      selectedValue: '',
    },
    usuario: {
      label: 'Usuario',
      value: this.edited.usuarioid,
    },
    courier: {
      label: 'Courier',
      value: '',
    },
    ordenSeguimiento: {
      label: 'Orden de Seguimiento',
      value: '',
    },
    localidad: {
      label: 'Localidad',
      id: 'locaid',
      value: '',
    },
    coordinador: {
      label: 'Coordinador',
      id: 'coorid',
      value: '',
    },
    tecnico: {
      label: 'Técnico',
      id: 'tecnicoid',
      value: '',
    },
    referencia: {
      label: 'Referencia',
      value: '',
    },
    observacion: {
      label: 'Observación',
      id: 'despaobs',
      value: '',
    },
    costo: {
      label: 'Costo',
      value: false,
    },
    valor: {
      label: 'Valor',
      value: '',
    },
    fechaRecepcion: {
      label: 'Fecha Recepción',
      value: '',
      selectedValue: '',
    },
    receptor: {
      label: 'Receptor',
      value: '',
    },
    anular: {
      label: 'Estado',
      value: 'VIGENTE',
      items: ['VIGENTE', 'ANULADO'],
    },
  };

  //abstract
  readonly funcionalidad: Funcionalidades = Funcionalidades.Despacho;

  //propiedades globales
  loadingService = new LoadingService();
  gridApi: GridApi;
  $snotify: any;
  dialog: boolean = true;
  dialogConfirmacionClose: boolean = false;
  validForm: boolean = false;
  dialogConfirmacion: boolean = false;
  btnBloquear: Boolean = false;
  mensajeConfirmacion: TranslateResult = '';

  //controllers
  readonly controller: string = 'funcionalidad';
  readonly controllerAccion: string = 'accion';
  readonly controllerModuloAccion: string = 'moduloaccion';
  axios: AxiosVue = new AxiosVue(ServicioProxy.GestionUsuario);

  //@Watch('show')
  async onPropertyChanged(value: boolean) {
    this.dialog = value;
    this.dialog = value;
    // permisos
    this.setBotonNav();
  }

  datosEditados: any = {};

  grabarEdicion() {
    this.datosEditados = {
      estado: this.formFields.anular.value == 'ANULADO' ? '1' : '0',
      despanumero: this.formFields.codigo.value,
      fechaRecepcion:
        this.formFields.fechaRecepcion.value != ''
          ? moment(this.formFields.fechaRecepcion.value).format('YYYY-MM-DD')
          : '',
      receptor: this.formFields.receptor.value,
      usuarioId: this.usuarioActivo.id,
      usuarioRut: this.usuarioActivo.rut,
    };
    this.editar();
  }
  async editar() {
    let self = this;
    return fetchDespacho(
      {
        despanumero: this.datosEditados.despanumero,
        fechaRecepcion: this.datosEditados.fechaRecepcion,
        receptor: this.datosEditados.receptor,
        estado: this.datosEditados.estado,
        usuarioId: this.datosEditados.usuarioId,
        usuarioRut: this.datosEditados.usuarioRut,
      },
      'conectaDespacho/editar'
    )
      .then((data: any) => {
        //console.log(data.data);
        if (data.data.CODIGO_RESPUESTA == '1') {
          self.$snotify.success('Actualizacion exitosa', { timeout: 3000 });
          this.closeModal(false);
          return null;
        } else {
          self.$snotify.error(data.data.MENSAJE_RESPUESTA, { timeout: 3000 });
          return [];
        }
      })
      .catch((error: any) => {
        self.$snotify.error('Ocurrió un error', { timeout: 3000 });
      })
      .finally(() => {
        return null;
      });
  }

  setBotonNav() {
    var accion = 'Editar';
    var evaluado = false;

    if (!this.esEdicion) {
      accion = 'Ver Detalle';
    }
  }

  cierraMenu() {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 0) {
      appBanners[0].remove();
    }
  }

  closeModal(val: boolean) {
    this.$validator.reset();
    document.getElementById('cardDivTV').scrollIntoView(true);
    this.$emit('modalAsociacionEmit', false);
    this.$emit('datoEditado', true);
    this.dialog = false;
    this.btnBloquear = false;
  }

  confirmCallback(val: any) {}

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }
}
</script>

<style scoped>
#alinear {
  text-align: justify;
}
.h2_title {
  font-weight: normal;
}
</style>
