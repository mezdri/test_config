<template>
  <v-layout row justify-center>
    <v-dialog
      v-model="dialog"
      persistent
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card id="cardDivRT">
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
            esEdicion ? 'Editar SIM' : 'Ver Detalle SIM'
          }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              depressed
              class="btn-grabar"
              v-if="esEdicion"
              @click="grabarEdicion(), (btnBloquear = true)"
              :disabled="!validForm || btnBloquear"
              >Guardar Cambios</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>
        <br />
        <br />
        <br />
        <div>
          <v-card height="55px" flat>
            <v-bottom-nav
              :active.sync="bottomNav"
              :value="true"
              absolute
              color="transparent"
            >
              <v-btn
                @click="cierraMenu"
                color="primary"
                flat
                v-show="
                  (informacionGeneral.visible && esEdicion) ||
                    (informacionGeneralVerDetalle.visible && !esEdicion)
                "
                :value="informacionGeneral.step"
              >
                <span>Información General</span>
                <v-icon>info</v-icon>
              </v-btn>
              <v-btn
                @click="cierraMenu"
                color="primary"
                flat
                v-show="
                  (asociarGps.visible && esEdicion) ||
                    (asociarGpsVerDetalle.visible && !esEdicion)
                "
                :value="asociarGps.step"
              >
                <span>Asociar GPS</span>
                <v-icon>my_location</v-icon>
              </v-btn>
            </v-bottom-nav>
          </v-card>
          <div
            align="center"
            v-show="
              bottomNav == informacionGeneral.step &&
                ((informacionGeneral.visible && esEdicion) ||
                  (informacionGeneralVerDetalle.visible && !esEdicion))
            "
            class="cardnew"
          >
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
                          style="margin-top: 12px!important;"
                        >
                          Informaci&oacute;n General
                        </h2>
                      </v-flex>
                    </div>
                    <v-divider></v-divider>
                    <br />
                    <v-layout wrap>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-validate="'required|numeric|max:20'"
                          v-model="editedItem.numeroSIM"
                          :error-messages="errors.collect('numSim')"
                          data-vv-name="numSim"
                          label="Número SIM"
                          :disabled="true"
                          :counter="20"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-select
                          v-model="selectedTipoSim"
                          :items="tiposSim"
                          item-text="nombre"
                          item-value="id"
                          label="Tipo SIM"
                          v-validate="'required'"
                          :error-messages="errors.collect('tipoSim')"
                          data-vv-name="tipoSim"
                          @change="changeTipoSIM"
                          :disabled="!esEdicion"
                          required
                        ></v-select>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-autocomplete
                          v-model="selectedCia"
                          v-validate="'required|max:20'"
                          :error-messages="errors.collect('cia')"
                          data-vv-name="cia"
                          :items="companiasTelco"
                          color="primary"
                          :clearable="true"
                          :disabled="!esEdicion"
                          item-text="nombre"
                          item-value="id"
                          label="Cía. Telecomunicaciones"
                          no-data-text="Sin resultados"
                          required
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-text-field
                          v-validate="{ max: 11, regex: /^(569)[0-9]\d{7}$/ }"
                          v-model="editedItem.numeroTelefonico"
                          :error-messages="errors.collect('numeroTelefonico')"
                          data-vv-name="numeroTelefonico"
                          label="Teléfono Celular"
                          type="text"
                          :placeholder="textoPlaceholder()"
                          :counter="11"
                          :disabled="!esEdicion"
                          required
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm12 md12>
                        <v-select
                          v-model="selectedEstado"
                          :items="estados"
                          item-text="nombre"
                          item-value="id"
                          label="Estado"
                          v-validate="'required'"
                          :error-messages="errors.collect('estado')"
                          data-vv-name="estado"
                          :disabled="!esEdicion"
                          required
                          @change="seleccionarEstadoSim"
                          persistent-hint
                          :hint="mensajeCambioEstadoEditar"
                        ></v-select>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-form>
              </v-card>
            </v-flex>
          </div>
          <div
            align="center"
            v-show="
              bottomNav == asociarGps.step &&
                ((asociarGps.visible && esEdicion) ||
                  (asociarGpsVerDetalle.visible && !esEdicion))
            "
            class="cardnew"
          >
            <br />
            <v-flex md10>
              <v-card class="rounded-card">
                <v-container grid-list-md text-xs-center>
                  <v-layout row wrap>
                    <div align="left">
                      <v-flex md12>
                        <h2 class="h2_title">Asociar GPS</h2>
                      </v-flex>
                    </div>
                  </v-layout>
                  <v-divider></v-divider>
                  <br />
                  <v-layout row wrap v-if="esEdicion">
                    <v-flex md6>
                      <v-text-field
                        label="Buscar..."
                        v-model="buscarGpsEditar"
                        @input="onFilterTextBoxChangedGpsEditar"
                        prepend-icon="lock_open"
                        append-icon="search"
                      ></v-text-field>
                    </v-flex>
                    <!-- <v-flex md6 style="padding-top:22px">
                      <div align="right">
                        <v-btn flat small color="primary">
                          <v-icon class="btn-asociar-icon" left>cloud_upload</v-icon>
                          <span class="btn-asociar-texto">Asociar desde Archivo</span>
                        </v-btn>
                      </div>
                    </v-flex>-->
                  </v-layout>
                  <br />
                  <v-layout row wrap>
                    <v-flex md12>
                      <v-card>
                        <ag-grid-vue
                          style="width: 100%; height: 380px; font-family: 'Asap', sans-serif;"
                          class="ag-theme-material"
                          :columnDefs="columnDefs"
                          :rowData="gpsRespaldo"
                          rowSelection="single"
                          rowMultiSelectWithClick="false"
                          pagination="true"
                          paginationPageSize="10"
                          suppressRowClickSelection="true"
                          :sideBar="sideBar"
                          :localeText="localeText"
                          :onGridReady="onGridReady"
                          :postProcessPopup="onClickCell"
                          suppressCopyRowsToClipboard="true"
                          @selection-changed="onSelectedChangeGpsEditar"
                          :getRowNodeId="getRowNodeIdEditar"
                          :suppressCsvExport="true"
                          :suppressExcelExport="true"
                          :isExternalFilterPresent="isExternalFilterPresentGps"
                          :doesExternalFilterPass="doesExternalFilterPassGps"
                        ></ag-grid-vue>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
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
          entidad: 'SIM',
          nombreEntidad: sim.numeroSIM,
        })
      "
      :mensaje="$t('mensajes.crud.editar.mensaje', { entidad: 'SIM' })"
      v-on:modalConfirmationEmit="confirmCallback($event, false)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogConfirmacionClose"
      :titulo="$t('mensajes.mensajesAbandono.editar.titulo')"
      :mensaje="$t('mensajes.mensajesAbandono.editar.mensaje')"
      v-on:modalConfirmationEmit="confirmCallbackConfirm($event, true)"
      :textoBtnSi="$t('mensajes.mensajesAbandono.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.mensajesAbandono.editar.btnCancelar')"
    ></app-confirmacion>

    <app-confirmacion
      :show="dialogCambioEstadoSim"
      :titulo="
        $t('mensajes.crud.editar.titulo', {
          entidad: 'SIM',
          nombreEntidad: sim.numeroSIM,
        })
      "
      :mensaje="mensajeConfirmacionEditar"
      v-on:modalConfirmationEmit="confirmCallback($event, true)"
      :textoBtnSi="$t('mensajes.crud.editar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.editar.btnCancelar')"
    ></app-confirmacion>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import config from '@/config/index';
import HandleErrors from '@/config/handleErrors';
import Confirmation from '@/components/Confirmation.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import { ISim } from '@/interfaces/Sim';
import { IGPS } from '@/interfaces/GPS';
import { EstadoInterface } from '@/interfaces/Estado';
import { EstadoEntidad, TipoSim, MarcaGps } from '@/config/enums';
import { EstadosService } from '@/services/estadosService';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { LoadingService } from '@/services/loadingService';
import { differenceBy } from 'lodash';
import {
  GridApi,
  ColumnApi,
  ColDef,
  GridReadyEvent,
  CellContextMenuEvent,
  RowNode,
} from 'ag-grid-community';
import { Funcionalidades } from '@/config/funcionalidades';
import { PermisoAccionVm } from '@/views/base/PermisoAccionVm';
import { ComponenteBaseStepper } from '@/views/base/ComponenteBaseStepper';
import { CodigoAccion } from '@/views/base/VariablesPermisos';
const { AgGridVue } = require('ag-grid-vue');

@Component({
  components: {
    'ag-grid-vue': AgGridVue,
    'app-confirmacion': Confirmation,
  },
})
export default class SimModalEdicion extends ComponenteBaseStepper {
  @Prop({ default: false }) show!: boolean;
  @Prop({ default: false }) esEdicion!: boolean;
  @Prop({ default: () => ({ id: 0, numeroSIM: '', estado: 0 }) }) sim!: ISim;

  //permisos
  funcionalidad: Funcionalidades = Funcionalidades.SIM;
  permisosActuales: PermisoAccionVm[] = [];

  informacionGeneral: PermisoAccionVm = {
    accion: 'Editar - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  asociarGps: PermisoAccionVm = {
    accion: 'Editar - Asociar GPS',
    visible: true,
    step: 2,
    codigoSubAccion: 34,
    codigoAccionPadre: CodigoAccion.Editar,
  };

  informacionGeneralVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Información General',
    visible: true,
    step: 1,
    codigoSubAccion: 19,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  asociarGpsVerDetalle: PermisoAccionVm = {
    accion: 'Ver Detalle - Asociar GPS',
    visible: true,
    step: 2,
    codigoSubAccion: 34,
    codigoAccionPadre: CodigoAccion.VerDetalle,
  };

  permisosTotales: PermisoAccionVm[] = [
    this.informacionGeneral,
    this.asociarGps,
    this.informacionGeneralVerDetalle,
    this.asociarGpsVerDetalle,
  ];

  //controller
  readonly controllerSim: string = 'Sim';
  readonly controllerGpsSim: string = 'GpsSim';
  readonly controllerGps: string = 'Gps';

  $snotify: any;
  btnText: string = 'Continuar';
  dialog: boolean = false;
  validForm: boolean = false;
  editedItem: ISim = {};
  dictionaryFormErrors: any = {};
  bottomNav: any = '1';
  dialogConfirmacion: boolean = false;
  dialogConfirmacionClose: boolean = false;
  handleErrors: HandleErrors = new HandleErrors();
  tiposSim: any = [];
  selectedTipoSim: any = null;
  btnBloquear: boolean = false;
  axios: AxiosVue = new AxiosVue(ServicioProxy.Gps);
  estados: EstadoInterface[] = [];
  selectedEstado: any = null;
  clienteId: number = config.getClienteSesion();
  companiasTelco: any = [];
  selectedCia: any = [];
  loadingService = new LoadingService();
  buscarGpsEditar: string = '';

  gpsAsignadosModel: IGPS = {};
  gpsAsignados: IGPS[] = [];
  gpsAsignadosResp: IGPS[] = [];
  gpsRespaldo: IGPS[] = [];

  autoGroupColumnDef: any = null;

  gridApi: GridApi;
  columnApi: ColumnApi;
  columnDefs: Array<ColDef> = [];
  sideBar: any = config.agGridDefaultConfig;
  localeText: any = config.agGridTextos;

  estadoSeleccionado: any = 0;
  mensajeCambioEstadoEditar: any = '';
  mensajeConfirmacionEditar: any = '';
  dialogCambioEstadoSim: boolean = false;

  created() {}

  mounted() {
    var estadosClass: EstadosService = new EstadosService();
    this.estados = estadosClass
      .getEstados()
      .filter(x => x.id == 0 || x.id == 1);
    this.estados.sort(function(vote1, vote2) {
      if (vote1.nombre > vote2.nombre) return 1;
      if (vote1.nombre < vote2.nombre) return -1;
    });

    for (let item in TipoSim) {
      if (!isNaN(Number(item))) {
        let nombre = TipoSim[item];
        this.tiposSim.push({
          id: Number(item),
          nombre: nombre,
        });
      }
    }
  }

  nombreCompletoGps(gps: any): string {
    if (gps !== null && gps !== undefined) {
      if (gps.gpsModelo !== null && gps.gpsModelo !== undefined) {
        if (
          gps.gpsModelo.gpsMarca !== null &&
          gps.gpsModelo.gpsMarca !== undefined
        ) {
          return (
            gps.numeroSerie + ' - ' + '(' + gps.gpsModelo.gpsMarca.nombre + ')'
          );
        }
      }
    }
    return gps.numeroSerie;

    /*return (
      gps.numeroSerie +
      " - " +
      "(" +
      (gps.gpsModelo.gpsMarca !== null && gps.gpsModelo.gpsMarca !== undefined
        ? gps.gpsModelo.gpsMarca.nombre
        : "") +
      ")"
    );*/
  }

  @Watch('show')
  async onPropertyChanged(value: boolean, oldValue: boolean) {
    this.dialog = value;
    this.btnText = 'Continuar';
    this.editedItem = this.sim;
    this.bottomNav = '1';
    this.gpsAsignadosModel = {};
    this.gpsAsignados = [];
    this.gpsRespaldo = [];
    this.gpsAsignadosResp = [];

    // permisos
    this.chequearPermisosEditarDetalle();
    this.setBotonNav();

    if (value) {
      try {
        this.loadingService.showLoading();
        this.initialize();
        this.companiasTelco = [];
        this.btnBloquear = false;
        if (this.esEdicion) {
          await this.getGPS();
        }
        this.selectedTipoSim = this.editedItem.tipoSim;
        this.selectedEstado = this.editedItem.estado;
        this.selectedCia = this.editedItem.empresaTelcoId;
        //this.changeTipoSIM(this.editedItem.tipoSim);
        await this.cargaInicialTipoSIM(this.editedItem.tipoSim);

        const res: any = await this.axios.http.get(
          `${this.controllerSim}/${this.sim.id}/simgps`
        );
        if (res.data.length > 0) {
          this.gpsAsignados = res.data;
          this.gpsAsignadosResp = Array.from(this.gpsAsignados);

          this.gpsAsignados.forEach((gps: IGPS) => {
            this.gpsAsignadosModel = gps;
          });
        }

        // se realiza check de los GPS asignados
        this.gpsRespaldo.forEach(gps => {
          let exists: any = this.gpsAsignados.filter(
            (x: any) => x.id === gps.id
          );
          if (exists.length == 0) {
            gps.checked = false;
          } else {
            gps.checked = true;
          }
        });
        await this.seteaAsignados();
        // selecciono la data para solucionar problema check header
        const self = this;
        this.gridApi.forEachNode(function(node: any) {
          var index = self.gpsAsignados.findIndex(x => x.id == node.data.id);
          if (index !== -1) {
            node.setSelected(true);
          }
        });
      } catch (err) {
        if (err.response !== undefined) {
          if (err.response.status !== 401) {
            this.handleErrors.showError(err);
          }
        } else {
          this.handleErrors.showError(err);
        }
      } finally {
        this.loadingService.hideLoading();
      }
    }
    if (this.gpsAsignados.length >= 1 && this.selectedEstado === 0) {
      this.mensajeCambioEstadoEditar = this.$t(
        'mensajes.crud.inactivoAsociado.mensaje'
      );
    } else if (this.selectedEstado === 0 && this.gpsAsignados.length == 0) {
      this.mensajeCambioEstadoEditar = this.$t(
        'mensajes.crud.inactivo.mensaje'
      );
    } else {
      this.mensajeCambioEstadoEditar = '';
    }
    this.mensajeConfirmacionEditar =
      this.mensajeCambioEstadoEditar +
      ' ¿Está seguro que desea guardar los cambios realizados?';
  }

  seteaAsignados() {
    if (!this.esEdicion) {
      this.gpsRespaldo = this.gpsAsignados;
    }
  }

  setBotonNav() {
    var accion = 'Editar';
    var evaluado = false;

    if (!this.esEdicion) {
      accion = 'Ver Detalle';
    }
    this.permisosTotales.forEach(obj => {
      if (obj.visible && obj.accion.includes(accion) && !evaluado) {
        this.bottomNav = obj.step;
        evaluado = true;
      }
    });
  }

  onGpsChange(gps: any) {
    if (this.gpsAsignados.length > 0) {
      for (let x = this.gpsAsignados.length - 1; x >= 0; x--) {
        let borrar = true;
        if (this.gpsAsignados[x].id == gps) {
          borrar = false;
        }
        if (borrar) {
          this.gpsAsignados.splice(x, 1);
        }
      }
    }
  }

  onGpsInput(gps: any) {
    if (gps !== undefined && gps !== null) {
      let itemGps = this.gpsRespaldo.find(x => x.id == gps);
      this.gpsAsignados = []; //Siempre en 1 solo GPS asignado
      this.gpsAsignados.push(itemGps);
    }
  }

  grabarEdicion() {
    this.$validator.validateAll().then(res => {
      if (res) {
        if (this.selectedEstado === 1) {
          this.dialogConfirmacion = true;
        } else {
          this.dialogCambioEstadoSim = true;
          this.btnBloquear = false;
        }
      }
    });
  }

  confirmCallback(val: boolean, est: boolean) {
    if (est === true) {
      this.gpsAsignados = [];
      this.gpsAsignadosModel = {};
    }

    this.dialogConfirmacion = false;
    if (val) {
      this.$validator.validateAll().then(res => {
        if (res) {
          this.loadingService.showLoading();
          let nombreCia = this.companiasTelco.find(
            (x: any) => x.id === this.selectedCia
          );

          this.btnBloquear = true;
          let he = new HandleErrors();
          this.editedItem.tipoSim = this.selectedTipoSim;
          this.editedItem.estado = this.selectedEstado;
          this.editedItem.clienteId = this.clienteId;
          this.editedItem.empresaTelcoId = this.selectedCia;
          this.editedItem.companiaTelecomunicaciones = nombreCia.nombre;

          //Edición
          this.axios.http
            .put(`${this.controllerSim}/`, this.editedItem)
            .then(res => {
              this.eliminaAsociacionesGPS();
            })
            .catch(error => {
              this.loadingService.hideLoading();
              this.btnBloquear = false;
              if (error.response !== undefined) {
                if (error.response.status !== 401) {
                  this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
                }
              } else {
                this.$snotify.error(this.$t('mensajes.mensajesError.editar'));
              }
            });
        }
      });
    }

    this.dialogConfirmacion = false;
    this.dialogCambioEstadoSim = false;
    this.btnBloquear = false;
  }

  confirmCallbackConfirm(val: boolean) {
    this.dialogConfirmacionClose = false;
    if (val) {
      this.closeModal(false);
    }
  }

  eliminaAsociacionesGPS() {
    //Elimina asociaciones
    let index = 0;
    let he = new HandleErrors();
    let gpsEliminar: any = [];

    this.gpsAsignadosResp.forEach((gps: IGPS) => {
      let exists = this.gpsAsignados.filter(z => z.id == gps.id);
      if (exists.length == 0) {
        gpsEliminar.push({
          Id: gps.id,
          NumeroSerie: gps.numeroSerie,
          Marca: gps.marca,
          IMEI: gps.imei,
          Estado: gps.estado,
        });
      }
    });

    if (gpsEliminar.length > 0) {
      gpsEliminar.forEach((user: any, idx: number) => {
        this.axios.http
          .delete(`${this.controllerSim}/${this.sim.id}/deleteSimGps`, {
            data: gpsEliminar,
          })
          .then(res => {
            index += 1;
            if (index == gpsEliminar.length) {
              this.grabaAsociacionesGps();
            }
          })
          .catch(err => {
            this.loadingService.hideLoading();
            this.btnBloquear = false;
            if (err.response !== undefined) {
              if (err.response.status !== 401) {
                this.$snotify.error(
                  'Ocurrió un error al actualizar asociación con GPS.'
                );
              }
            } else {
              this.$snotify.error(
                'Ocurrió un error al actualizar asociación con GPS.'
              );
            }
            throw idx;
          });
      });
    } else {
      this.grabaAsociacionesGps();
    }
  }

  onClickCell(params: CellContextMenuEvent) {
    var appBanners = document.getElementsByClassName(
      'ag-menu'
    ) as HTMLCollectionOf<HTMLElement>;
    if (appBanners.length > 1) {
      appBanners[0].remove();
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

  grabaAsociacionesGps() {
    let index = 0;
    let he = new HandleErrors();

    //graba nuevos
    if (this.gpsAsignados.length > 0) {
      this.gpsAsignados.forEach((gps: IGPS, idx: number) => {
        let existe = this.gpsAsignadosResp.filter(x => x.id == gps.id);

        if (existe.length == 0) {
          let model: any = {
            Id: 0,
            GpsId: gps.id,
            SimId: this.sim.id,
            FechaInicioAsociacion: new Date(),
            FechaFinAsociacion: null,
            UsuarioCreadorId: 0,
            UsuarioModificacionId: null,
            FechaCreacion: new Date(),
            FechaModificacion: null,
          };

          this.axios.http
            .post(`${this.controllerGpsSim}/`, model)
            .then(res => {
              index = index + 1;
              if (index == this.gpsAsignados.length) {
                this.loadingService.hideLoading();
                this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
                this.closeModal(false);
                this.dialogConfirmacion = false;
              }
            })
            .catch(error => {
              this.loadingService.hideLoading();
              this.btnBloquear = false;
              if (error.response !== undefined) {
                if (error.response.status !== 401) {
                  this.$snotify.error(
                    'Ocurrió un error al actualizar asociación con GPS.'
                  );
                }
              } else {
                this.$snotify.error(
                  'Ocurrió un error al actualizar asociación con GPS.'
                );
              }
              throw idx;
            });
        } else {
          index = index + 1;
          if (index == this.gpsAsignados.length) {
            this.loadingService.hideLoading();
            this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
            this.closeModal(false);
          }
        }
      });
    } else {
      this.loadingService.hideLoading();
      this.$snotify.success(this.$t('mensajes.mensajesExito.editar'));
      this.closeModal(false);
    }
  }

  closeModal(val: boolean) {
    document.getElementById('cardDivRT').scrollIntoView(true);
    this.btnBloquear = false;
    this.editedItem = {};
    this.buscarGpsEditar = '';
    this.gridApi.setQuickFilter('');
    this.$emit('modalAsociacionEmit', false);
    this.dialog = false;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  async getGPS() {
    const res: any = await this.axios.http.get(
      `${this.controllerGps}/${this.clienteId}/GetGpsPorCliente`
    );
    /*res.data = res.data.filter(
      (x: IGPS) =>
        x.estado === EstadoEntidad.Activo && x.clienteId === this.clienteId
    );*/

    res.data = res.data.map((node: any) => ({
      ...node,
      estadoTxt: EstadoEntidad[node.estado],
    }));

    res.data.forEach((item: any) => {
      if (item.gpsSims.length == 0) {
        this.gpsRespaldo.push(item);
      } else {
        let canAdd = item.gpsSims.filter(
          (x: any) => x.fechaFinAsociacion === null
        );
        if (canAdd.length === 0) {
          this.gpsRespaldo.push(item);
        } else if (canAdd[0].simId === this.sim.id) {
          this.gpsRespaldo.push(item);
        }
      }
    });
    // this.axios.http
    //   .get(`${this.controllerGps}/`)
    //   .then(res => {

    //   })
    //   .catch(error => {
    //     if (error.response !== undefined) {
    //       if (error.response.status !== 401) {
    //         this.$snotify.error("Ocurrió un error al obtener lista de GPS.");
    //       }
    //     } else {
    //       this.$snotify.error("Ocurrió un error al obtener lista de GPS.");
    //     }
    //     this.loadingService.hideLoading();
    //   });
  }

  changeTipoSIM(tipoSim: number) {
    this.axios.http
      .get('sim/' + tipoSim + '/telcos')
      .then(res => {
        this.companiasTelco = res.data;
        this.selectedCia = [];
      })
      .catch(err => {
        this.companiasTelco = [];
      });
  }

  seleccionarEstadoSim(tipoEstado: any) {
    this.estadoSeleccionado = tipoEstado;

    switch (this.estadoSeleccionado) {
      case 1: // estado Activo
        this.mensajeCambioEstadoEditar = '';
        break;

      case 0: // estado Inactivo
        if (this.gpsAsignados.length >= 1) {
          this.mensajeCambioEstadoEditar = this.$t(
            'mensajes.crud.inactivoAsociado.mensaje'
          );
        } else {
          this.mensajeCambioEstadoEditar = this.$t(
            'mensajes.crud.inactivo.mensaje'
          );
        }
        this.mensajeConfirmacionEditar =
          this.mensajeCambioEstadoEditar +
          ' ¿Está seguro que desea guardar los cambios realizados?';
        break;
    }
  }

  // async confirmCallbackEstado(val: boolean) {
  //   this.dialogCambioEstadoSim = false;
  //   let permisoStepLicencia: boolean = false;

  //   if (val === true) {

  //     this.gpsAsignadosModel = {};
  //     this.gpsAsignados = [];
  //     if(this.gpsAsignadosResp.length>0)
  //     {
  //       await this.eliminaAsociacionesGPS();
  //     }

  //     this.close();

  //   } else {
  //     this.editedItem.estado = 0;
  //   }
  // }
  //   close() {
  //   this.loadingService.hideLoading();
  //   this.closeModal(false);
  //   this.dialogConfirmacion = false;
  // }

  async cargaInicialTipoSIM(tipoSim: number) {
    const res: any = await this.axios.http.get('sim/' + tipoSim + '/telcos');
    this.companiasTelco = res.data;

    // this.axios.http
    // .get("sim/" + tipoSim + "/telcos")
    // .then(res => {
    //   this.companiasTelco = res.data;
    // })
    // .catch(err => {
    //   this.companiasTelco = [];
    // });
  }

  fechaFilter(r: any) {
    return this.$options.filters.formatDate(r.value);
  }

  createButtonCell(params: any) {
    let item = this.gpsRespaldo.find(x => x.id == params.data.id);
    if (item === undefined) item = params.data;

    let eButton = document.createElement('button');
    eButton.setAttribute('id', 'btnU' + params.data.id);
    eButton.setAttribute('title', 'Remover');

    if (this.esEdicion) {
      eButton.setAttribute(
        'class',
        'v-btn v-btn--flat v-btn--icon theme--light'
      );
    } else {
      eButton.setAttribute('disabled', 'true');
      eButton.setAttribute(
        'class',
        'v-btn v-btn--flat v-btn--disabled v-btn--icon theme--light'
      );
    }

    eButton.innerHTML =
      '<div class="v-btn__content"><i aria-hidden="true" class="v-icon material-icons theme--light">delete</i></div>';

    eButton.addEventListener('click', () => {
      this.removerGpsAsignacion(item);
    });

    return eButton;
  }

  removerGpsAsignacion(item: IGPS) {
    for (let i = 0; i < this.gpsAsignados.length; i++) {
      if (this.gpsAsignados[i].id == item.id) {
        this.gpsAsignados.splice(i, 1);
        break;
      }
    }

    if (item !== undefined && item !== null) {
      this.gpsAsignadosModel = null;
    }
  }

  textoPlaceholder() {
    if (this.esEdicion) return '56999999999';
    else return '';
  }

  initialize() {
    this.columnDefs = [
      {
        headerName: '',
        field: 'checked',
        width: 70,
        minWidth: 70,
        pinned: 'left',
        checkboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        suppressMenu: true,
        resizable: true,
        sortable: true,
        filter: false,
        suppressMovable: true,
        lockVisible: true,
        sort: 'desc',
        cellRenderer: (r: any) => {
          if (r.data.checked) {
            return r.node.setSelected(r.data.checked);
          }
        },
      },
      {
        headerName: 'Código',
        field: 'id',
        resizable: true,
        lockPinned: true,
        sortable: true,
        hide: true,
        minWidth: 80,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Nro. Serie',
        field: 'numeroSerie',
        resizable: true,
        lockPinned: true,
        sortable: true,
        width: 200,
        minWidth: 80,
        lockVisible: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Marca',
        field: 'gpsModelo.gpsMarca.nombre',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'Modelo',
        field: 'gpsModelo.nombre',
        resizable: true,
        lockPinned: true,
        width: 200,
        minWidth: 80,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      {
        headerName: 'IMEI',
        field: 'imei',
        width: 200,
        minWidth: 80,
        lockPinned: true,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
      },
      {
        headerName: 'Estado',
        field: 'estadoTxt',
        lockPinned: true,
        width: 200,
        minWidth: 80,
        resizable: true,
        sortable: true,
        cellStyle: { textAlign: 'left' },
        comparator: function(valueA, valueB, nodeA, nodeB, isInverted) {
          return config.caseInsensitiveSort(
            valueA,
            valueB,
            nodeA,
            nodeB,
            isInverted
          );
        },
      },
      // {
      //   headerName: 'Desasociar',
      //   width: 150,
      //   minWidth: 150,
      //   pinned: 'right',
      //   cellRenderer: this.createButtonCell,
      //   filter: false,
      //   suppressMovable: true,
      //   resizable: false,
      //   sortable: false,
      //   lockVisible: true,
      //   cellStyle: { textAlign: 'left' },
      // },
    ];

    this.dictionaryFormErrors = {
      custom: {
        cia: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        numSim: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          numeric: config.errorMensajes.soloNumeros,
        },
        tipoSim: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
        },
        numeroTelefonico: {
          required: () => config.errorMensajes.textoRequerido,
          max: config.errorMensajes.maxLength,
          regex: config.errorMensajes.regex,
        },
      },
    };
    this.$validator.localize('es', this.dictionaryFormErrors);

    if (!this.esEdicion) {
      this.columnDefs.shift();
    }
  }

  onFilterTextBoxChangedGpsEditar() {
    this.gridApi.onFilterChanged();
    // if (this.buscarGpsEditar.length > 1) {
    //   this.gridApi.setQuickFilter(this.buscarGpsEditar);
    // } else {
    //   this.gridApi.setQuickFilter('');
    // }
  }

  onSelectedChangeGpsEditar() {
    this.gpsAsignados = this.gridApi.getSelectedRows();
    const gpsSeleccionados = this.gridApi
      .getSelectedNodes()
      .map(node => ({ ...node.data, checked: true }));

    const gpsNoSeleccionados = differenceBy(
      this.gpsRespaldo,
      gpsSeleccionados,
      gps => gps.id
    ).map(gps => ({
      ...gps,
      checked: false,
    }));
    this.gridApi.updateRowData({
      update: [...gpsNoSeleccionados, ...gpsSeleccionados],
    });
  }
  getRowNodeIdEditar(gps: IGPS) {
    if (!gps) {
      return;
    }
    return gps.id;
  }

  isExternalFilterPresentGps(): boolean {
    return true;
  }

  doesExternalFilterPassGps(node: RowNode): boolean {
    if (this.gpsRespaldo.length > 0 && this.buscarGpsEditar.length > 1) {
      let busqueda = this.buscarGpsEditar.toLowerCase();
      return (
        node.data.numeroSerie.toLowerCase().includes(busqueda) ||
        node.data.gpsModelo.gpsMarca.nombre.toLowerCase().includes(busqueda) ||
        node.data.gpsModelo.nombre.toLowerCase().includes(busqueda) ||
        node.data.imei.toLowerCase().includes(busqueda) ||
        node.data.estadoTxt.toLowerCase().includes(busqueda)
      );
    }
    return true;
  }
}
</script>

<style scoped>
.h2_title {
  font-weight: normal;
}
</style>
