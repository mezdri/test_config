<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="650">
      <v-card id="cardDivRT">
        <v-toolbar dark color="primary">
          <v-btn
            icon
            dark
            @click="dialogConfirmacionClose = true"
            v-on:keydown.enter.prevent
            v-on:keydown.space.prevent
          >
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title style="font-size:17px;margin-left: 10px !important"
            >Agrupar Conductores en:</v-toolbar-title
          >
        </v-toolbar>
        <v-divider></v-divider>
        <div>
          <v-card height="55px" flat>
            <v-bottom-nav
              :active.sync="bottomNav"
              :value="true"
              absolute
              color="transparent"
            >
              <v-btn color="primary" flat value="1">
                <span>NUEVO GRUPO</span>
                <v-icon>save</v-icon>
              </v-btn>
              <v-btn color="primary" flat value="2">
                <span>GRUPO EXISTENTE</span>
                <v-icon>edit</v-icon>
              </v-btn>
            </v-bottom-nav>
          </v-card>
          <v-form
            ref="form"
            v-model="validForm"
            lazy-validation
            class="col-md-12"
          >
            <div align="center" v-show="bottomNav == '1'">
              <v-flex xs12 sm12 md12>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12 sm12 md12>
                      <span>
                        Los Conductores seleccionados se asociarán bajo el nuevo
                        grupo a crear:
                      </span>
                    </v-flex>
                    <v-flex xs12 sm12 md12>
                      <v-text-field
                        v-model="conductorText"
                        label="Nombre del Grupo de Conductores."
                        prepend-icon="group_work"
                        v-validate="{
                          rules: {
                            required: conductorGrupoSelected ? false : true,
                            max: 80,
                            GrupoConductorNombreUnicoCrear: true,
                          },
                        }"
                        :counter="80"
                        :error-messages="errors.collect('texto')"
                        data-vv-name="texto"
                        type="text"
                        :clearable="true"
                        @input="grupoTextoChange"
                        required
                      ></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-flex>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="white" depressed small @click="closeModal(false)">
                  <span style="color: #526da5">Cancelar</span>
                </v-btn>
                <v-btn
                  color="primary"
                  :disabled="!validForm || textoGrupo === '' ? true : false"
                  @click="grabar()"
                  >Guardar Cambios</v-btn
                >
              </v-card-actions>
            </div>
            <div align="center" v-show="bottomNav == '2'">
              <v-flex xs12 sm12 md12>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12 sm12 md12>
                      <span>
                        Los Conductores seleccionados pertenecerán al siguiente
                        grupo:
                      </span>
                    </v-flex>
                    <v-flex xs12 sm12 md12>
                      <v-autocomplete
                        :items="conductorGrupo"
                        v-model="conductorGrupoSelected"
                        color="primary"
                        item-text="nombre"
                        :clearable="true"
                        item-value="id"
                        label="Nombre del Grupo de Conductores."
                        prepend-icon="group_work"
                        v-validate="{
                          rules: { required: conductorText ? false : true },
                        }"
                        :error-messages="errors.collect('combo')"
                        data-vv-name="combo"
                        @change="selectedgrupoId"
                        required
                        no-data-text="Sin resultados"
                      ></v-autocomplete>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-flex>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="white" depressed small @click="closeModal(false)">
                  <span style="color: #526da5">Cancelar</span>
                </v-btn>
                <v-btn
                  color="primary"
                  :disabled="!validForm || comboGrupo === '' ? true : false"
                  @click="grabar()"
                  >Guardar Cambios</v-btn
                >
              </v-card-actions>
            </div>
          </v-form>
        </div>
      </v-card>
    </v-dialog>
    <app-confirmacion
      :show="dialogConfirmacion"
      :mensaje="
        $t('mensajes.gridMensajes.asociar.mensaje', {
          las_cantidad_entidad_seleccionadas:
            data.length > 1
              ? ' los conductores seleccionados?'
              : 'l conductor seleccionado?',
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
import moment from 'moment';

import { IConductor, IConductorGrupo } from '../../interfaces/Conductores';
import { EstadoInterface } from '../../interfaces/Estado';
import { EstadosService } from '../../services/estadosService';

import { Component, Prop, Emit, Watch } from 'vue-property-decorator';

import { debuglog } from 'util';
import { exists } from 'fs';
import { Validator } from 'vee-validate';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class EtiquetasModalEdicion extends Vue {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({
    default: () => ({ id: 0, nombre: '', estado: EstadoEntidad.Activo }),
  })
  conductores!: IConductor;
  @Prop({ default: [] }) data!: any;

  //Variables globales
  $snotify: any;
  btnText: string = 'Guardar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: IConductor = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  asignados: any = [];

  conductorText: string = '';
  conductorGrupoSelected: any = 0;
  conductorGrupo: IConductorGrupo[] = [];

  //--------------------------------------------------------------------------------------------------
  //SELECT--------------------------------------------------------------------------------------------
  estadosClass: EstadosService = new EstadosService();
  estado: EstadoInterface[] = this.estadosClass.getEstados();
  estadoSeleccionado: any = 0;
  //--------------------------------------------------------------------------------------------------
  handleErrors: HandleErrors = new HandleErrors();
  //grilla
  localeText: any = config.agGridTextos;
  gridApi: any;
  columnApi: any;

  columnDefs: any = [];
  columnVehiculosDefs: any = [];
  sideBar: any = config.agGridDefaultConfig;
  autoGroupColumnDef: any = null;

  //Utilizados para validacion cruzada..........................................................
  comboGrupo: any = '';
  textoGrupo: any = '';
  //............................................................................................
  //CONTEXTOS INSTANCIAS ------------------------------------------------------------------------------------
  axContextoVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  //---------------------------------------------------------------------------------------------------------

  //lOAD ---------------------------------------------------------------------------

  initialize() {
    this.getGrupoConductores();

    this.dictionaryFormErrors = {
      custom: {
        texto: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          GrupoConductorNombreUnicoCrear:
            '* Ya existe un Grupo de Conductores con este nombre.',
        },
        combo: {
          required: () => config.errorMensajes.textoRequerido,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);

    //this.setSeleccionadosSelect()
  }
  mounted() {
    this.initialize();
  }

  //EVENTOS -----------------------------------------------------------------------
  @Watch('show')
  onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Guardar';
    this.editedItem = this.conductores;
    this.bottomNav = '1';
    this.conductorText = '';

    if (value) {
      if (this.conductores.id > 0) {
        this.initialize();
      }
    }
  }

  //--------------------------------------------------------------------------------
  //MODAL -------------------------------------------------------------------
  closeModal(val: boolean) {
    this.dialogConfirmacionClose = false;
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.conductorText = '';
    this.editedItem = {};
    this.comboGrupo = '';
    this.textoGrupo = '';
    this.conductorGrupoSelected = 0;
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
    this.$validator.errors.clear();
    this.$validator.reset();
  }
  //-------------------------------------------------------------------------

  //GRID  -------------------------------------------------------------------
  onGridReady(params: any) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  //FUNCIONES ---------------------------------------------------------------
  formatDate(fecha: Date): string {
    if (!fecha) return null;
    return moment(fecha).format('DD/MM/YYYY');
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  estadoNombre(r: any) {
    return this.$options.filters.estadoFilter(r.value);
  }
  //MODIFICACION --------------------------------------------------------
  grabar() {
    this.$validator.validateAll().then(res => {
      if (res) {
        this.dialogConfirmacion = true;
      }
    });
  }
  confirmCallback(val: boolean) {
    this.dialogConfirmacion = false;
    let he = new HandleErrors();

    if (val) {
      this.$validator.validateAll().then(res => {
        if (res) {
          this.aplicar();
        }
      });
    }
  }
  //Funciones---------------------------------------------------------------------------------
  close() {
    this.closeModal(false);
    this.dialogConfirmacion = false;
  }
  //UTIL /////////////////////////////////////////////////////////////////////////////////////
  getClienteId(): string {
    return config.getClienteSesion().toString();
  }
  closeSuccessCrear() {
    this.closeModal(false);
    this.$snotify.success(
      'Grupo de Conductores ha sido creado de forma exitosa'
    );
  }
  closeSuccessModificar() {
    this.conductorGrupoSelected = '';
    this.closeModal(false);
    this.$snotify.success('Los cambios han sido guardados de forma exitosa');
  }
  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }
  created() {
    const self = this;

    Validator.extend('GrupoConductorNombreUnicoCrear', {
      getMessage(field: any, params: any, data: any) {
        return '* Nombre ya se encuentra creado.';
      },
      validate(value: any) {
        if (value !== '') {
          return self.axContextoVehiculo.http
            .get(`conductorGrupo/${0}/${value}/ChequearNombreUnico`)
            .then(response => {
              return new Promise(resolve => {
                resolve({
                  valid: response.data,
                  data: response.data
                    ? undefined
                    : { message: '* Nombre ya se encuentra creado.' },
                });
              });
            })
            .catch(err => {
              return true;
            });
        } else {
          return true;
        }
      },
    });
  }
  //CARGA SELECT Y AUTOCOMPLETE-------------------------------------------------------------
  getGrupoConductores() {
    this.axContextoVehiculo.http
      .get('conductorgrupo/' + this.getClienteId() + '/GrupoConductoresCliente')
      .then(res => {
        this.conductorGrupo = res.data;
      })
      .catch(error => {
        this.handleErrors.showError(error);
      });
  }
  selectedgrupoId(e: any) {
    this.conductorGrupoSelected = e;
    this.conductorText = '';
    this.textoGrupo = '';
    this.comboGrupo = 'x';
  }
  grupoTextoChange() {
    this.conductorGrupoSelected = 0;
    this.comboGrupo = '';
    this.textoGrupo = 'x';
  }

  aplicar() {
    if (this.conductorGrupoSelected == 0) {
      let model = {
        id: 0,
        clienteId: this.getClienteId(),
        nombre: this.conductorText,
        descripcion: this.conductorText,
        estado: EstadoEntidad.Activo,
      };

      this.axContextoVehiculo.http
        .post('conductorGrupo/', model)
        .then(res => {
          let index = 0;
          this.data.forEach((item: any) => {
            let model = item;

            model.conductorGrupoId = res.data.id;

            this.axContextoVehiculo.http
              .put('conductor/', model)
              .then(res => {
                index = index + 1;
                if (index == this.data.length) {
                  this.closeSuccessCrear();
                  this.getGrupoConductores();
                }
              })
              .catch(err => {
                this.$snotify.error(
                  this.$t('mensajes.mensajesAsociacionesError.editar')
                );
              });
          });
        })
        .catch(error => {
          this.$snotify.error(
            this.$t('mensajes.mensajesAsociacionesError.existe')
          );
        });
    } else {
      let index = 0;
      this.data.forEach((item: any) => {
        let model = item;

        model.conductorGrupoId = this.conductorGrupoSelected;

        this.axContextoVehiculo.http
          .put('conductor/', model)
          .then(res => {
            index = index + 1;
            if (index == this.data.length) {
              this.closeSuccessModificar();
            }
          })
          .catch(err => {
            this.$snotify.error(
              this.$t('mensajes.mensajesAsociacionesError.editar')
            );
          });
      });
    }
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>
<style>
#cardDivRT {
  text-align: justify;
}
</style>
