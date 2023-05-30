<template>
  <div align="center">
    <v-flex md10>
      <v-card class="rounded-card">
        <v-form ref="form" lazy-validation class="col-md-12">
          <v-container grid-list-md text-xs-center>
            <StepTitle>Agregar Campos</StepTitle>
            <v-divider></v-divider>
            <v-layout row wrap>
              <v-flex xs12 sm6 md6 offset-xs10 align-end>
                <AgregarButton
                  @click="handleAgregarClick()"
                  v-show="!modoVer"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex md12>
                <v-card>
                  <MantenedorGrid
                    v-if="!modoEditar && !modoVer"
                    :grid-options="gridOptions"
                  />
                  <MantenedorGrid
                    v-if="modoEditar || modoVer"
                    :grid-options="gridOptionsEditarVer"
                  />
                </v-card>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
      </v-card>
    </v-flex>
    <Confirmation
      :show="mostrarConfirmacionEliminar"
      :titulo="tituloConfirmacionEliminar"
      :mensaje="
        $t('mensajes.crud.eliminar.mensaje', {
          entidad: 'Campo de Datos',
        })
      "
      v-on:modalConfirmationEmit="handleCierreConfirmacionEliminar"
      :textoBtnSi="$t('mensajes.crud.eliminar.btnAceptar')"
      :textoBtnNo="$t('mensajes.crud.eliminar.btnCancelar')"
    ></Confirmation>
    <CrearCampoDatosModal
      :show="muestraModalCampo"
      :lstTipoDato="lstTipoDato"
      :campoSeleccionado="campoSeleccionado"
      :modoEditar="modoEditarCampo"
      @cerrar="handleCierreModal"
      @crear="handleCampoCrear"
      @editar="handleCampoEditar"
    ></CrearCampoDatosModal>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { actionsEvent } from '@/setup';
import { Snotify } from '@/snotify/Snotify';

const { AgGridVue } = require('ag-grid-vue');
import {
  GridOptions,
  GridApi,
  ColumnApi,
  GridReadyEvent,
  ValueFormatterParams,
} from 'ag-grid-community';
import {
  checkboxColumnDef,
  makeAccionesModal,
} from '@/reusable/Grid/aggridColumnDefUtils';

import { LoadingService } from '@/services/loadingService';
import { Funcionalidades } from '@/config/funcionalidades';
import { ComponenteBase, Accion } from '@/views/base/ComponenteBase';
import MantenedorGrid from '@/reusable/Grid/MantenedorGrid.vue';
import CabeceraTabla from '@/reusable/Grid/CabeceraTabla.vue';
import AgregarButton from '@/reusable/Grid/AgregarButton.vue';
import StepTitle from '@/reusable/Mantenedor/StepTitle.vue';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy } from '@/config/enums';
import Confirmation from '@/components/Confirmation.vue';

import CrearCampoDatosModal from '@/pantallas/ConfigurarBase/CrearCampoDatosModal.vue';
import {
  typeNuevosCampo,
  typeTipoCampo,
  AlertasBaseBackend,
} from './ConfiguracionBase';

@Component({
  components: {
    StepTitle,
    CabeceraTabla,
    MantenedorGrid,
    AgregarButton,
    Confirmation,
    CrearCampoDatosModal,
  },
})
export default class AgregarCamposGrid extends Vue {
  @Prop({ default: false }) modoVer: boolean;
  @Prop({ default: false }) modoEditar: boolean;
  @Prop() camposDinamicos: typeNuevosCampo[];

  muestraModalCampo: boolean = false;
  modoEditarCampo: boolean = false;
  campoSeleccionado: typeNuevosCampo = {};
  mostrarConfirmacionEliminar: boolean = false;

  axios: AxiosVue = new AxiosVue(ServicioProxy.Alerta);
  readonly Controller: string = 'AlertaBase';

  //Data
  lstTipoDato: typeTipoCampo[] = [];

  /* aggrid */

  lstCampos: typeNuevosCampo[] = [];
  columnApi: ColumnApi;
  gridApi: GridApi = null;

  /* template */

  readonly gridOptions: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'codigoCampo',
        lockVisible: true,
      },
      {
        headerName: 'Tipo de Dato',
        field: 'tipoCampo',
        cellRenderer: this.formatTipoDato,
      },
      {
        headerName: 'Descripción',
        field: 'descripcionCampo',
      },
      {
        headerName: 'Expresión regular',
        field: 'regExp',
      },
      makeAccionesModal({
        onEliminar: this.handleEliminarClick,
        onEditar: this.handleEditarClick,
      }),
    ],
    rowSelection: 'single',
    onGridReady: this.handleGridReady,
  };

  readonly gridOptionsEditarVer: GridOptions = {
    columnDefs: [
      {
        headerName: 'Código',
        field: 'codigoCampo',
        lockVisible: true,
      },
      {
        headerName: 'Tipo de Dato',
        field: 'tipoCampo',
        cellRenderer: this.formatTipoDato,
      },
      {
        headerName: 'Descripcion',
        field: 'descripcionCampo',
      },
    ],
    rowSelection: 'single',
    onGridReady: this.handleGridReady,
  };

  /* misc */

  readonly $snotify: Snotify;
  readonly loadingService = new LoadingService();

  mounted() {
    this.getTipoCampo();
  }

  async getTipoCampo() {
    this.loadingService.showLoading();
    this.axios.http
      .get(`${this.Controller}/GetTipoCampo`)
      .then(res => {
        if (res !== null && res !== undefined) {
          this.lstTipoDato = res.data;
        }

        setTimeout(() => {
          this.handleCamposDinamicosChange();
        }, 100);
      })
      .catch(error => {
        if (error.response !== undefined) {
          if (error.response.status !== 401) {
            this.$snotify.error('Ocurrió un error al tipo de campo.');
          }
        } else {
          this.$snotify.error('Ocurrió un error al tipo de campo.');
        }
      })
      .finally(() => {
        this.loadingService.hideLoading();
      });
  }

  /* event handlers */

  handleGridReady(event: GridReadyEvent) {
    this.gridApi = event.api;
    this.gridApi.setRowData(this.lstCampos);
  }

  handleAgregarClick() {
    this.muestraModalCampo = true;
  }

  handleCierreModal() {
    this.campoSeleccionado = {};
    this.muestraModalCampo = false;
    this.modoEditarCampo = false;
  }

  handleCampoCrear(nuevoCampo: typeNuevosCampo) {
    if (!this.lstCampos) {
      this.lstCampos = [];
    }

    this.lstCampos.push(nuevoCampo);
    this.$emit('changeCampos', this.lstCampos);
    this.gridApi.setRowData(this.lstCampos);
  }

  handleCampoEditar(nuevoCampo: typeNuevosCampo) {
    var index = this.lstCampos.findIndex(
      s => s.codigoCampo == this.campoSeleccionado.codigoCampo
    );

    this.lstCampos[index].codigoCampo = nuevoCampo.codigoCampo;
    this.lstCampos[index].tipoCampo = nuevoCampo.tipoCampo;
    this.lstCampos[index].descripcionCampo = nuevoCampo.descripcionCampo;
    this.lstCampos[index].regExp = nuevoCampo.regExp;
    this.lstCampos[index].requerido = nuevoCampo.requerido;
    this.lstCampos[index].mensajeErrorFormato = nuevoCampo.mensajeErrorFormato;

    this.$emit('changeCampos', this.lstCampos);
    this.gridApi.setRowData(this.lstCampos);
  }

  handleEliminarClick(params: any) {
    this.campoSeleccionado = this.lstCampos.find(
      s => s.codigoCampo == params.codigoCampo
    );

    this.mostrarConfirmacionEliminar = true;
  }

  handleCierreConfirmacionEliminar(isConfirmado: boolean) {
    this.mostrarConfirmacionEliminar = false;
    if (isConfirmado) {
      var index = this.lstCampos.findIndex(
        s => s.codigoCampo == this.campoSeleccionado.codigoCampo
      );

      this.campoSeleccionado = {};
      this.lstCampos.splice(index, 1);
      this.gridApi.setRowData(this.lstCampos);
      this.$emit('changeCampos', this.lstCampos);
    }
  }

  get tituloConfirmacionEliminar() {
    const { campoSeleccionado } = this;
    return this.$t('mensajes.crud.eliminar.titulo', {
      entidad: 'Campo de Datos',
      nombreEntidad: campoSeleccionado ? campoSeleccionado.codigoCampo : '',
    });
  }

  handleEditarClick(params: any) {
    this.campoSeleccionado = this.lstCampos.find(
      s => s.codigoCampo == params.codigoCampo
    );
    this.modoEditarCampo = true;
    this.muestraModalCampo = true;
  }

  handleCamposDinamicosChange() {
    if (this.camposDinamicos) {
      this.lstCampos = this.camposDinamicos ? this.camposDinamicos : [];
      this.gridApi.setRowData(this.lstCampos);
    }
  }

  formatTipoDato(params: ValueFormatterParams) {
    return this.lstTipoDato.find(td => td.id == params.data.tipoCampo).campo;
  }
}
</script>
